/*
 * Internet Open Protocol Abstraction (IOPA)
 * Copyright (c) 2016-2020 Internet of Protocols Alliance
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

import { AppPropertiesBase, IopaContext } from 'iopa-types'
import Middleware from './middleware'
import guid from '../util/guid'
import Factory from '../iopa/factory'
import { cloneDoubleLayer as clone } from '../util/shallow'
import IopaMap from '../iopa/map'

const packageVersion = require('../../package.json').version

export class AppCapabilities {
  'urn:io.iopa:app': { 'server.Version': string }
}
export class AppPropertiesWithCapabilities<T> extends IopaMap<
  AppPropertiesBase<T>
> {
  capability<K extends keyof T>(key: K): T[K] {
    return this.get('server.Capabilities').get(key)
  }

  setCapability<K extends keyof T>(key: K, value: T[K]) {
    this.get('server.Capabilities').set(key, value)
  }
}

/** AppBuilder Class to Compile/Build all Middleware in the Pipeline into single IOPA AppFunc */
export default class AppBuilder {
  public properties: AppPropertiesWithCapabilities<AppCapabilities>

  private middleware

  constructor(options?: Partial<AppPropertiesBase<AppCapabilities>> | string) {
    const defaults = new AppPropertiesWithCapabilities<AppCapabilities>({
      'server.AppId': guid(),
      'app.DefaultApp': DefaultApp,
      'app.DefaultMiddleware': [DefaultMiddleware],
      'server.Capabilities': new IopaMap<AppCapabilities>({
        'urn:io.iopa:app': { 'server.Version': packageVersion }
      })
    })

    if (typeof options === 'string') {
      options = { 'server.AppId': options }
    }

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (key === 'server.Capabilities') {
          const capabilities = defaults.get('server.Capabilities')
          Object.entries(value).forEach(([key2, value2]) => {
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
    const context = this.Factory.createContext(url, options)
    return context
  }

  public fork(when: (context: any) => boolean): AppBuilder {
    const subApp = new AppBuilder(this.properties.toJSON())

    this.use(async (context, next) => {
      if (!subApp.properties.get('server.IsBuilt')) {
        subApp.build()
      }

      if (when(context)) {
        await subApp.invoke(context)
        return Promise.resolve(null)
        // do not call next on main pipeline after forked pipeline is invoked
      }

      return next()
    })

    return subApp
  }

  /** Add Middleware Function to AppBuilder pipeline */
  public use(mw: any, id: string)

  public use(mw: any)

  public use(method: string, mw?: any) {
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
      const mwInstance = new Mw(this)

      if (typeof mwInstance.invoke === 'function') {
        this.middleware.invoke.push(mwInstance.invoke.bind(mwInstance))
      }

      if (typeof mwInstance.dispatch === 'function') {
        this.middleware.dispatch.push(mwInstance.dispatch.bind(mwInstance))
      }
    } else {
      this.middleware[method].push(this.middlewareProxy(this, mw))
    }

    return this
  }

  /** Compile/Build all Middleware in the Pipeline into single IOPA AppFunc */
  public build() {
    const middleware = this.properties
      .get('app.DefaultMiddleware')
      .concat(this.middleware.invoke)
      .concat(this.properties.get('app.DefaultApp'))
    const pipeline = this.compose_(middleware) as any

    if (this.middleware.dispatch.length > 0) {
      pipeline.dispatch = this.compose_(this.middleware.dispatch.reverse())
    } else {
      pipeline.dispatch = context => {
        return Promise.resolve(context)
      }
    }

    pipeline.properties = this.properties
    this.properties.set('server.IsBuilt', true)
    this.properties.set('server.Pipeline', pipeline)
    return pipeline
  }

  /** Call Dispatch Pipeline  to process given context */
  public dispatch(context) {
    return this.properties.get('server.Pipeline').dispatch.call(this, context)
  }

  /** Call App Invoke Pipeline to process given context */
  public invoke(context): Promise<void> {
    return this.properties.get('server.Pipeline').call(this, context)
  }

  /** Compile/Build all Middleware in the Pipeline into single IOPA AppFunc  */
  public compose_(middleware) {
    let i
    let next
    let curr
    i = middleware.length
    next = context => {
      return Promise.resolve(context)
    }

    // eslint-disable-next-line no-plusplus
    while (i--) {
      curr = middleware[i]
      next = ((fn, prev, context) => {
        const _next = prev.bind(this, context)
        _next.invoke = prev
        return fn.call(this, context, _next)
      }).bind(this, curr, next)
    }

    return (context: IopaContext) => {
      const capabilities = this.properties.get('server.Capabilities')

      context.capability =
        context.capability ||
        ((key: any) => {
          return context['server.Capabilities'].get(key)
        })

      context.get =
        context.get ||
        ((key: any) => {
          return context[key]
        })

      context.set =
        context.set ||
        ((key: any, value: any) => {
          context[key] = value
        })

      context.set(
        'server.Capabilities',
        new IopaMap<AppCapabilities>(clone(capabilities)) as any
      )

      if (context.response) {
        context.response.get =
          context.response.get ||
          ((key: any) => {
            return context.response[key]
          })

        context.response.set =
          context.response.set ||
          ((key: any, value: any) => {
            context.response[key] = value
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
function DefaultMiddleware(context, next) {
  const value = next()

  if (typeof value === 'undefined') {
    console.error(
      'Server Error: One of the middleware functions on this server returned no value'
    )
  } else {
    return value
  }
}

/** Default app used at end of pipeline if not handled by any other middleware */
function DefaultApp(context: IopaContext, _: () => Promise<void>) {
  return Promise.resolve(context)
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm

/** Gets the parameter names of a javascript function */
function _getParams(func) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '')
  let result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .match(/([^\s,]+)/g)
  if (result === null) {
    result = []
  }
  result = result.join()
  return result
}
