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

import {
  ContextCore,
  IopaResponseBase,
  IopaRequestBase,
  IopaMap,
  IopaContext,
  IopaResponse
} from 'iopa-types'

import { merge, cloneDoubleLayer, mergeContext } from '../util/shallow'
import { ContextBase } from './context'
import FreeList from '../util/freelist'

/** Represents IopaContext Factory of up to 100 items */
export default class Factory<
  T extends IopaMap<IopaRequestBase> & { init: Function; dispose?: Function }
> {
  private _factory: FreeList<T>

  constructor(
    name = 'IopaContext',
    size = 100,
    factory: () => T = () => new ContextBase() as any
  ) {
    this._factory = new FreeList(name, size, factory)
  }

  /** Creates a new IOPA Context */
  public createContext(
    url?: string,
    options?: Partial<IopaRequestBase> & {
      withResponse?: boolean
    }
  ): T {
    const optionsValid = _validOptions(options)

    const context: T & {
      init: Function
      dispose?: Function
    } & ContextCore = this._factory.alloc().init()
    context.dispose = this._dispose.bind(this, context)
    context.set('server.Id', `#${_nextSequence()}`)

    if (optionsValid.withResponse) {
      const response: IopaMap<IopaResponseBase> &
        IopaResponseBase = this._factory.alloc().init()

      const request = (context as any) as IopaContext

      request.set('iopa.Body', Promise.resolve(''))
      request.set('iopa.Headers', new Map())
      request.set('iopa.Labels', new Map())
      request.set('iopa.Method', 'GET')
      request.set('iopa.OriginalUrl', url || 'https://localhost/factory')
      request.set('iopa.Url', new URL(request.get('iopa.OriginalUrl')!))
      request.set('iopa.Path', '/')
      request.set('iopa.Protocol', 'HTTPS/2.0')
      request.set('iopa.QueryString', '')
      request.set('iopa.RemoteAddress', '::1')
      request.set('iopa.Scheme', 'https:')
      request.set('server.Source', 'create')
      request.set('server.Timestamp', Date.now())

      request.response = response

      response.set('iopa.StatusCode', 200)
      response.set('iopa.Size', 0)
      response.set('iopa.StatusText', 'OK')
      response.set('iopa.Headers', new Map<string, string>())

      response.end = async (body) => {
        if (body && body.length) {
          response.set('iopa.Size', response.get('iopa.Size') + body.length)
        }
        response.set('iopa.Body', body)
        context.get('iopa.Events').emit('end', response)
      }

      response.send = async (body, sendoptions) => {
        if (sendoptions) {
          if (sendoptions.headers) {
            response.set(
              'iopa.Headers',
              new Map(
                Array.from(((sendoptions.headers as any).entries as Function)())
              )
            )
          }
          if (sendoptions.status) {
            response.set('iopa.StatusCode', sendoptions.status)
          }
          if (sendoptions.statustext) {
            response.set('iopa.StatusText', sendoptions.statustext)
          }
        }
        return response.end(body)
      }

      delete optionsValid.withResponse
    }

    context.create = this.createChildContext.bind(this, context)

    mergeContext(context, optionsValid)

    return context as T
  }

  /** Creates a new IOPA Context that is a child request/response of a parent Context */
  public createChildContext(
    parentContext: IopaMap<IopaRequestBase>,
    url: string,
    options: any
  ): T {
    options = _validOptions(options)

    const context = this.createContext()
    _mergeCapabilities(context as any, parentContext as any)

    context.set('iopa.Path', parentContext.get('iopa.Path') + url || '')
    context.set('iopa.Scheme', parentContext.get('iopa.Scheme'))
    context['iopa.Host'] = parentContext['iopa.Host']
    context['iopa.Port'] = parentContext['iopa.Port']

    mergeContext(context, options)

    return context
  }

  /** Release the memory used by a given IOPA Context */
  private _dispose(context: T & IopaRequestBase & { response: IopaResponse }) {
    if (context == null || context.get('server.CancelTokenSource') == null) {
      return
    }

    if (context.response) {
      const { response } = context

      Object.keys(response).forEach((prop) => {
        response[prop] = null
      })

      this._factory.free(response as any)
    }

    Object.keys(context).forEach((prop) => {
      context[prop] = null
    })

    this._factory.free(context)
  }
}

/** Merges server.Capabilities of parent Context onto child Context */
function _mergeCapabilities(
  childContext: { response: any; ['server.ParentContext']: any },
  parentContext: { response: any; ['server.Capabilities']: any }
) {
  childContext['server.ParentContext'] = parentContext
  merge(
    childContext['server.Capabilities'],
    cloneDoubleLayer(parentContext['server.Capabilities'])
  )

  if (childContext.response && parentContext.response) {
    merge(
      childContext.response['server.Capabilities'],
      cloneDoubleLayer(parentContext.response['server.Capabilities'])
    )
  }
}

/** Clean Options;  allows overide for future validation  */
function _validOptions(options?: any) {
  if (typeof options === 'string' || options instanceof String) {
    const result = {}
    result['iopa.Method'] = options
    return result
  }
  return options || {}
}

const maxSequence = 2 ** 16
let _lastSequence = Math.floor(Math.random() * (maxSequence - 1))

function _nextSequence() {
  _lastSequence += 1
  if (_lastSequence === maxSequence) {
    _lastSequence = 1
  }

  return _lastSequence.toString()
}
