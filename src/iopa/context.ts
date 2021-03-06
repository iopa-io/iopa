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
import * as util from '../util/util'
import EventEmitter from '../util/events'
import { cloneFilter } from '../util/shallow'
import { default as URLParse } from '../util/url'

const maxSequence = Math.pow(2, 16)
var _lastSequence = Math.floor(Math.random() * (maxSequence - 1))

/** Represents IOPA Context object for any State Flow or REST Request/Response */
export default class IopaContext {
  constructor() {}

  /** Initialize blank IopaContext object;  Generic properties common to all server types included */
  init() {
    this[IOPA.Version] = VERSION
    this[IOPA.Seq] = '#' + _nextSequence()
    this[IOPA.Events] = new EventEmitter()
    this[SERVER.CancelTokenSource] = new CancellationTokenSource()
    this[SERVER.Capabilities] = {}
    this[SERVER.CancelToken] = this[SERVER.CancelTokenSource].token
    return this
  }

  toString() {
    return util.inspect(
      cloneFilter(this, [
        SERVER.CancelTokenSource,
        SERVER.CancelToken,
        SERVER.Logger,
        'log',
        'response',
        SERVER.Events,
        SERVER.CancelTokenSource,
        SERVER.CancelToken,
        'dispose',
        SERVER.Factory
      ])
    )
  }

  parseUrl(url) {
    URLParse(this, url)
  }

  get log() {
    return this[SERVER.Logger]
  }

  set log(logger: any) {
     this[SERVER.Logger] = logger
  }

  using(appFuncPromiseOrValue) {
    if (typeof appFuncPromiseOrValue === 'function')
      return _using(this, appFuncPromiseOrValue(this))
    else return _using(this, appFuncPromiseOrValue)
  }
}

/* ES6 finally/dispose pattern for IOPA Context */
function _using(context, p) {
  return new Promise(function(resolve, reject) {
    if (typeof p === 'undefined') p = null
    resolve(p)
  }).then(
    function(value) {
      return Promise.resolve(
        (function() {
          process.nextTick(function() {
            if (context.dispose) context.dispose()
          })
          return value
        })()
      )
    },
    function(err) {
      context.log.error(err)
      process.nextTick(function() {
        if (context.dispose) context.dispose()
      })
      throw err
    }
  )
}

function _nextSequence() {
  if (++_lastSequence === maxSequence) _lastSequence = 1

  return _lastSequence.toString()
}
