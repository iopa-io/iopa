/*
 * Internet Open Protocol Abstraction (IOPA)
 * Copyright (c) 2016-2019 Internet of Protocols Alliance
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

import { default as CancellationTokenSource } from '../util/cancellation'
import { IOPA, SERVER, VERSION } from './constants'
import { cloneDoubleLayer } from '../util/shallow'
import { merge } from '../util/shallow'
import { default as IopaContext } from './context'
import { FreeList } from '../util/freelist'
import { mergeContext } from '../util/shallow'

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}

/** Represents IopaContext Factory of up to 100 items */
export default class Factory {
  private _logger
  private _factory

  constructor(options?: any) {
    options = options || {}
    var size = options['factory.Size'] || 100

    this._logger = options[SERVER.Logger] || console

    this._factory = new FreeList('IopaContext', size, function() {
      return new IopaContext()
    })
  }

  static Context = IopaContext

  public get [SERVER.Logger]() {
    return this._logger
  }
  public set [SERVER.Logger](value) {
    this._logger = value
  }

  /** Creates a new IOPA Context */
  public createContext(url?: string, options?: any) {
    options = this.validOptions(options)

    var context = this._factory.alloc().init()
    context.dispose = this._dispose.bind(this, context)
    context[SERVER.Logger] = this._logger

    if (!options['reqres']) {
      context[IOPA.Method] = options[IOPA.Method] || IOPA.METHODS.GET
      context[IOPA.Path] = ''
      context[IOPA.Body] = null

      context[SERVER.IsLocalOrigin] = true
      context[SERVER.IsRequest] = true
      if (url) context.parseUrl(url)
    }

    context.create = this.createChildContext.bind(this, context)

    mergeContext(context, options)

    return context
  }

  /** Creates a new IOPA Context that is a child request/response of a parent Context */
  public createChildContext(parentContext, url, options) {
    options = this.validOptions(options)

    var context = this.createContext()
    this.mergeCapabilities(context, parentContext)

    context[IOPA.Path] = parentContext[IOPA.Path] + (url || '')
    context[IOPA.Scheme] = parentContext[IOPA.Scheme]
    context[IOPA.Host] = parentContext[IOPA.Host]
    context[IOPA.Port] = parentContext[IOPA.Port]

    mergeContext(context, options)

    return context
  }

  /** Merges SERVER.Capabilities of parent Context onto child Context */
  private mergeCapabilities(childContext, parentContext) {
    childContext[SERVER.ParentContext] = parentContext
    merge(
      childContext[SERVER.Capabilities],
      cloneDoubleLayer(parentContext[SERVER.Capabilities])
    )

    if (childContext.response && parentContext.response)
      merge(
        childContext.response[SERVER.Capabilities],
        cloneDoubleLayer(parentContext.response[SERVER.Capabilities])
      )
  }

  /** Release the memory used by a given IOPA Context */
  private _dispose(context) {
    if (context == null || context[SERVER.CancelTokenSource] == null) return

    if (context.response) {
      var response = context.response
      for (var prop in response) {
        if (response.hasOwnProperty(prop)) {
          response[prop] = null
        }
      }
      this._factory.free(response)
    }

    for (var prop in context) {
      if (context.hasOwnProperty(prop)) {
        context[prop] = null
      }
    }

    this._factory.free(context)
  }

  /** Clean Options;  allows overide for future validation  */
  private validOptions(options) {
    if (typeof options === 'string' || options instanceof String) {
      var result = {}
      result[IOPA.Method] = options
      return result
    } else return options || {}
  }

  /** Creates a new IOPA Context for Connect */
  private _createRaw() {
    var context = this._factory.alloc().init()
    context.dispose = this._dispose.bind(this, context)
    context[SERVER.Logger] = this._logger
    return context
  }
}
