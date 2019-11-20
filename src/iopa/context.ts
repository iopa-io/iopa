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

import {
  ContextBase as IContextBase,
  IEventEmitter,
  ContextCore as IContextCore
} from 'iopa-types'
import CancellationTokenSource, { Token } from '../util/cancellation'
import { VERSION } from './constants'
import { EventEmitter } from '../util/events'

import IopaMap from './map'

/** Represents IOPA Context object for any State Flow or REST Request/Response */
export class ContextBase<T extends IContextBase> extends IopaMap<T>
  implements IContextBase {
  readonly 'iopa.Events': IEventEmitter

  readonly 'iopa.Version': string

  readonly 'server.Id': string

  readonly 'server.CancelTokenSource': CancellationTokenSource

  readonly 'server.Capabilities': IopaMap<any>

  readonly 'server.CancelToken': Token

  readonly 'server.Source': any

  readonly 'server.Timestamp': number

  dispose?: () => void

  create?: () => this

  /** Initialize blank IopaContext object;  Generic properties common to all server types included */
  public init(): this {
    const tokensource = new CancellationTokenSource()

    this.set('server.Timestamp', Date.now())
    this.set('iopa.Events', new EventEmitter())
    this.set('iopa.Version', VERSION)
    this.set('server.CancelTokenSource', tokensource)
    this.set('server.CancelToken', tokensource.token)
    this.set('server.Capabilities', new IopaMap())
    return this
  }

  public using(appFuncPromiseOrValue) {
    if (typeof appFuncPromiseOrValue === 'function') {
      return _using(this, appFuncPromiseOrValue(this))
    }
    return _using(this, appFuncPromiseOrValue)
  }

  public get 'server.TimeElapsed'(): number {
    return Date.now() - this['server.Timestamp']
  }

  capability<K extends keyof T>(key: K): T[K] {
    return this.get('server.Capabilities').get(key)
  }

  setCapability<K extends keyof T>(key: K, value: T[K]) {
    this.get('server.Capabilities').set(key, value)
  }
}

/** Represents IOPA Context object for any State Flow or REST Request/Response */
export class ResponseBase<T extends IContextCore> extends IopaMap<T>
  implements IContextCore {
  readonly 'iopa.Version': string

  readonly 'server.Id': string

  readonly 'iopa.Events': IEventEmitter

  readonly 'server.Capabilities': IopaMap<any>

  dispose?: () => void

  /** Initialize blank IopaContext object;  Generic properties common to all server types included */
  public init() {
    return this
  }
}

/* ES6 finally/dispose pattern for IOPA Context */
function _using(context, p) {
  return new Promise((resolve, reject) => {
    if (typeof p === 'undefined') {
      p = null
    }
    resolve(p)
  }).then(
    value => {
      return Promise.resolve(
        (() => {
          process.nextTick(() => {
            if (context.dispose) {
              context.dispose()
            }
          })
          return value
        })()
      )
    },
    err => {
      console.error(err)
      process.nextTick(() => {
        if (context.dispose) {
          context.dispose()
        }
      })
      throw err
    }
  )
}
