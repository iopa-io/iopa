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

import { default as Middleware } from './middleware'
import { default as guidFactory } from '../util/guid'
import { default as Factory } from '../iopa/factory'

import { merge } from '../util/shallow'
import { cloneDoubleLayer as clone } from '../util/shallow'
import { IOPA, SERVER, APPBUILDER } from '../iopa/constants'
import { AppProperties } from '..'

const packageVersion = require('../../package.json').version

/** AppBuilder Class to Compile/Build all Middleware in the Pipeline into single IOPA AppFunc */
export default class AppBuilder {
  public properties
  private middleware

  constructor(properties: Partial<AppProperties> | string = {}) {
    this.properties = properties

    if (typeof this.properties == 'string' || this.properties instanceof String)
      this.properties = { 'server.AppId': this.properties }

    var defaults = {}
    defaults[SERVER.AppId] = guidFactory()
    defaults[SERVER.Capabilities] = {}
    defaults[SERVER.Capabilities][IOPA.CAPABILITIES.App] = {}
    defaults[SERVER.Capabilities][IOPA.CAPABILITIES.App][
      SERVER.Version
    ] = packageVersion
    defaults[SERVER.Logger] = console
    defaults[APPBUILDER.DefaultApp] = DefaultApp
    defaults[APPBUILDER.DefaultMiddleware] = [DefaultMiddleware]

    merge(this.properties, defaults)

    this.middleware = { invoke: [], dispatch: [] }
  }

  public get log() {
    return this.properties[SERVER.Logger]
  }

  public set log(logger) {
     this.properties[SERVER.Logger] = logger
  }

  public middlewareProxy = Middleware

  public Factory = new Factory()

  public createContext(url?: string, options?: any) {
    var context = this.Factory.createContext(url, options)
    return context
  }

  /** Add Middleware Function to AppBuilder pipeline */
  public use(mw: any)
  public use(method: string, mw?: any) {
    if (typeof method === 'function' && !mw) {
      mw = method
      method = 'invoke'
    }

    if (!this.middleware[method]) throw 'Unknown AppBuilder Category ' + method

    var params = private_getParams(mw)
    if (params === 'app' || mw.length === 1) {
      var mw_instance = new mw(this)

      if (typeof mw_instance.invoke === 'function')
        this.middleware.invoke.push(mw_instance.invoke.bind(mw_instance))

      if (typeof mw_instance.dispatch === 'function')
        this.middleware.dispatch.push(mw_instance.dispatch.bind(mw_instance))
    } else this.middleware[method].push(this.middlewareProxy(this, mw))

    return this
  }

  /** Compile/Build all Middleware in the Pipeline into single IOPA AppFunc */
  public build() {
    var middleware = this.properties[APPBUILDER.DefaultMiddleware]
      .concat(this.middleware.invoke)
      .concat(this.properties[APPBUILDER.DefaultApp])
    var pipeline = this.compose_(middleware)

    if (this.middleware.dispatch.length > 0)
      pipeline['dispatch'] = this.compose_(this.middleware.dispatch.reverse())
    else
      pipeline['dispatch'] = function(context) {
        return Promise.resolve(context)
      }

    pipeline['properties'] = this.properties
    this.properties[SERVER.IsBuilt] = true
    this.properties[SERVER.Pipeline] = pipeline
    return pipeline
  }

  /** Call Dispatch Pipeline  to process given context */
  public dispatch(context) {
    return this.properties[SERVER.Pipeline].dispatch.call(this, context)
  }

  /** Call App Invoke Pipeline to process given context */
  public invoke(context) {
    return this.properties[SERVER.Pipeline].call(this, context)
  }

  /** Compile/Build all Middleware in the Pipeline into single IOPA AppFunc  */
  public compose_(middleware) {
    var app = this

    var i, next, curr
    i = middleware.length
    next = function(context) {
      return Promise.resolve(context)
    }

    while (i--) {
      curr = middleware[i]
      next = function(fn, prev, context) {
        var _next = prev.bind(app, context)
        _next.invoke = prev
        return fn.call(app, context, _next)
      }.bind(app, curr, next)
    }

    return function app_pipeline(context) {
      const capabilities = app.properties[SERVER.Capabilities]

      context[SERVER.Capabilities] = context[SERVER.Capabilities] || {}
      merge(context[SERVER.Capabilities], clone(capabilities))

      if (context.response) {
        context.response[SERVER.Capabilities] =
          context.response[SERVER.Capabilities] || {}
        merge(context.response[SERVER.Capabilities], clone(capabilities))
      }

      return next.call(app, context)
    }
  }
}

/** Default middleware handler used at start of pipeline  */
function DefaultMiddleware(context, next) {
  var value = next()

  if (typeof value == 'undefined') {
    context.log.error(
      'Server Error: One of the middleware functions on this server returned no value'
    )
  } else return value
}

/** Default app used at end of pipeline if not handled by any other middleware */
function DefaultApp(context, next) {
  if (context[IOPA.Error]) return Promise.reject(context[IOPA.Error])
  else return Promise.resolve(context)
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm

/** Gets the parameter names of a javascript function */
function private_getParams(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '')
  var result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .match(/([^\s,]+)/g)
  if (result === null) result = []
  result = result.join()
  return result
}
