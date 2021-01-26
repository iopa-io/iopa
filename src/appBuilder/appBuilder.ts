/* eslint-disable no-restricted-syntax */
/*
 * Internet Open Protocol Abstraction (IOPA)
 * Copyright (c) 2016-2020 Internet Open Protocol Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {
  AppProperties as IAppProperties,
  AppPropertiesBase,
  IopaContext,
  FC,
  Capabilities,
  App,
  IopaRef,
  AppCapabilitiesBase,
  IopaMapInit,
  IopaApp
} from 'iopa-types'
import guid from '../util/guid'
import Factory from '../iopa/factory'
import { cloneDoubleLayer as clone } from '../util/shallow'
import IopaMap from '../iopa/map'
import Middleware from './middleware'

const packageVersion = require('../../package.json').version

interface AppCapabilities {
  'urn:io.iopa:app': { 'server.Version': string }
}

class AppPropertiesWithCapabilities<C> extends IopaMap<
  AppPropertiesBase<C> & C
> {
  capability(keyOrRef: keyof C | IopaRef<any>, value: any) {
    if (typeof keyOrRef === 'string') {
      return this.get('server.Capabilities').get(keyOrRef as keyof C)
    }
    return this[(keyOrRef as IopaRef<any>).id]
  }

  setCapability(keyOrRef: keyof C | IopaRef<any>, value: any) {
    if (typeof keyOrRef === 'string') {
      this.get('server.Capabilities').set(keyOrRef as keyof C, value)
      return
    }
    this.get('server.Capabilities')[(keyOrRef as IopaRef<any>).id] = value
  }
}

/** AppBuilder Class to Compile/Build all Middleware in the Pipeline into single IOPA AppFunc */
export default class AppBuilder implements IopaApp {
  public properties: IAppProperties<{}, AppCapabilities>

  private middleware: {
    invoke: Array<FC>
    dispatch: Array<FC>
  }

  logging: {
    flush(): void
    log(context: IopaContext, message: any, ...optionalParams: any): void
    warn(context: IopaContext, message: any, ...optionalParams: any): void
    error(context: IopaContext, message: any, ...optionalParams: any): void
  }

  constructor(
    options: Partial<AppPropertiesBase<AppCapabilities>> | string = {}
  ) {
    const defaults: any = new AppPropertiesWithCapabilities<AppCapabilities>({
      'server.AppId': guid(),
      'app.DefaultApp': DefaultApp,
      'app.DefaultMiddleware': [DefaultMiddleware],
      'server.Testing': new IopaMap(),
      'server.Related': [],
      'server.Capabilities': new IopaMap<AppCapabilities>({
        'urn:io.iopa:app': { 'server.Version': packageVersion }
      })
    })

    if (typeof options === 'string') {
      options = { 'server.AppId': options }
    } else if ('app.DefaultMiddleware' in options) {
      delete options['app.DefaultMiddleware']
    }

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (key === 'server.Capabilities') {
          const capabilities = defaults.get('server.Capabilities')
          Object.entries(value!).forEach(([key2, value2]) => {
            capabilities.set((key2 as unknown) as any, value2)
          })
        } else {
          defaults.set((key as unknown) as any, value)
        }
      })
    }

    this.properties = defaults

    this.middleware = { invoke: [], dispatch: [] }
  }

  capability<K extends keyof AppCapabilities>(key: K): AppCapabilities[K] {
    return this.properties.get('server.Capabilities').get(key)
  }

  setCapability<K extends keyof AppCapabilities>(
    key: K,
    value: AppCapabilities[K]
  ) {
    this.properties.get('server.Capabilities').set(key, value)
  }

  public middlewareProxy = Middleware

  public Factory = new Factory()

  public createContext(url?: string, options?: any) {
    const context = (this.Factory.createContext(
      url,
      options
    ) as unknown) as IopaContext
    return context
  }

  public fork(when: (context: any) => boolean): IopaApp {
    const subApp = new AppBuilder(this.properties.toJSON())

    this.use(async function forkFunction(
      context: IopaContext,
      next: () => Promise<void>
    ) {
      if (!subApp.properties.get('server.IsBuilt')) {
        subApp.build()
      }

      if (when(context)) {
        await subApp.invoke(context)
        return Promise.resolve(null)
        // do not call next on main pipeline after forked pipeline is invoked
      }

      return next()
    },
    'forkFuncton')

    return subApp
  }

  /** Add Middleware Function to AppBuilder pipeline */
  public use(mw: any, id: string): this

  public use(mw: any): this

  public use(method: 'invoke' | 'dispatch', mw?: any): this {
    let id

    /** Fix comnmon es6 module interop issues */
    if (typeof method === 'object' && 'default' in method) {
      // eslint-disable-next-line dot-notation
      method = method['default']
    } else if (typeof mw === 'object' && 'default' in mw) {
      // eslint-disable-next-line dot-notation
      method = mw['default']
    }

    if (typeof method === 'function' && typeof mw === 'string') {
      /** resilience wrapper style */
      id = mw
      mw = method
      method = 'invoke'
    } else if (typeof method === 'function' && !mw) {
      mw = method
      method = 'invoke'
    } else if (method === undefined) {
      throw new Error(
        `app.use called with undefined / empty middleware for ${mw}`
      )
    }

    if (!this.middleware[method]) {
      throw new Error(
        `Unknown AppBuilder Category ${JSON.stringify(
          method,
          null,
          2
        )} for ${id}`
      )
    }

    const params = _getParams(mw)
    if (params === 'app' || mw.length === 1) {
      const Mw = mw
      let mwInstance: any
      try {
        mwInstance = new Mw(this)
      } catch (ex) {
        console.log(ex)
        // in case this is a js lambda function
        mwInstance = Mw(this) || {}
      }

      if (typeof mwInstance.invoke === 'function') {
        this.middleware.invoke.push(mwInstance.invoke.bind(mwInstance))
      }

      if (typeof mwInstance.dispatch === 'function') {
        this.middleware.dispatch.push(mwInstance.dispatch.bind(mwInstance))
      }
    } else {
      this.middleware[method].push(
        this.middlewareProxy((this as unknown) as App<any, any>, mw)
      )
    }

    return this
  }

  public dispose() {
    /** noop */
  }

  /** Compile/Build all Middleware in the Pipeline into single IOPA AppFunc */
  public build() {
    const middleware = this.properties
      .get('app.DefaultMiddleware')
      .concat(this.middleware.invoke)
      .concat(this.properties.get('app.DefaultApp'))

    const pipeline: FC & {
      properties: IAppProperties<{}, AppCapabilities>
      dispatch: FC
    } = this.compose_(middleware) as any

    if (this.middleware.dispatch.length > 0) {
      pipeline.dispatch = this.compose_(this.middleware.dispatch.reverse())
    } else {
      pipeline.dispatch = (context) => {
        return Promise.resolve()
      }
    }

    pipeline.properties = this.properties
    this.properties.set('server.IsBuilt', true)
    this.properties.set('server.Pipeline', pipeline)
    return pipeline
  }

  /** Call Dispatch Pipeline  to process given context */
  public dispatch(context: IopaContext) {
    return this.properties.get('server.Pipeline').dispatch.call(this, context)
  }

  /** Call App Invoke Pipeline to process given context */
  public invoke(context: IopaContext): Promise<void> {
    if (!this.properties.get('server.IsBuilt')) {
      this.build()
    }
    return this.properties.get('server.Pipeline').call(this, context)
  }

  /** Compile/Build all Middleware in the Pipeline into single IOPA AppFunc  */
  public compose_(middleware: Array<FC>) {
    let i: number
    let next: (context: IopaContext) => Promise<IopaContext>
    let curr: FC
    i = middleware.length
    next = (context: IopaContext) => {
      return Promise.resolve(context)
    }

    // eslint-disable-next-line no-plusplus
    while (i--) {
      curr = middleware[i]
      if (!curr) {
        console.error(middleware, i)
        throw new Error('Missing middleware')
      }
      next = ((fn: FC, prev: FC, context: IopaContext) => {
        const _next = prev.bind(this, context)
        _next.invoke = prev
        return fn.call(this, context, _next)
      }).bind(this, curr, next)
    }

    return (context: IopaContext) => {
      const capabilities = this.properties.get('server.Capabilities')

      context.capability =
        context.capability ||
        ((keyOrRef: keyof AppCapabilitiesBase | IopaRef<any>) => {
          if (typeof keyOrRef === 'string') {
            return this.properties.get('server.Capabilities').get(keyOrRef)
          }
          return this.properties.get('server.Capabilities')[keyOrRef.id]
        })

      context.get =
        context.get ||
        ((key: string) => {
          return context[key as any]
        })

      context.set =
        context.set ||
        ((data: string | IopaMapInit<Record<any, any>>, value?: any) => {
          if (typeof data === 'string') {
            context[data as any] = value
            return
          }
          if (Array.isArray(data)) {
            for (const entry of data) {
              context.set(entry[0], entry[1])
            }
          } else if ('entries' in data) {
            for (const entry of (data.entries as Function)()) {
              context.set(entry[0], entry[1])
            }
          } else {
            for (const entry of Object.entries(data) as any) {
              context.set(entry[0], entry[1])
            }
          }
        })

      context.set(
        'server.Capabilities',
        new IopaMap<AppCapabilities>(clone(capabilities)) as Capabilities<any>
      )

      if (context.response) {
        context.response.get =
          context.response.get ||
          ((key: any) => {
            return context.response[key]
          })

        context.response.set =
          context.response.set ||
          ((data: string | IopaMapInit<Record<any, any>>, value?: any) => {
            if (typeof data === 'string') {
              context.response[data as any] = value
              return
            }
            if (Array.isArray(data)) {
              for (const entry of data) {
                context.response.set(entry[0], entry[1])
              }
            } else if ('entries' in data) {
              for (const entry of (data.entries as Function)()) {
                context.response.set(entry[0], entry[1])
              }
            } else {
              for (const entry of Object.entries(data) as any) {
                context.response.set(entry[0], entry[1])
              }
            }
          })

        context.response.set(
          'server.Capabilities',
          context.get('server.Capabilities')
        )
      }

      return next.call(this, context)
    }
  }
}

/** Default middleware handler used at start of pipeline  */
function DefaultMiddleware(
  context: IopaContext,
  next: () => Promise<void>
): Promise<void> {
  const value = next()

  if (typeof value === 'undefined') {
    console.error(
      'Server Error: One of the middleware functions on this server returned no value'
    )
    return Promise.resolve()
  }
  return value
}

/** Default app used at end of pipeline if not handled by any other middleware */
function DefaultApp(
  context: IopaContext,
  next: () => Promise<void>
): Promise<void> {
  return Promise.resolve()
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm

/** Gets the parameter names of a javascript function as a comma separated string */
function _getParams(func: Function): string {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '')
  let result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .match(/([^\s,]+)/g)
  if (result === null) {
    result = []
  }
  return result.join()
}
