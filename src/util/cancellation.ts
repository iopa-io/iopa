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

import { CancellationToken, CancellationTokenSource } from 'iopa-types'

/**  A Cancellation Token Source */
export class TokenSource implements CancellationTokenSource {
  private data: {
    reason: string
    isCancelled: boolean
    listeners: ((reason: string) => void)[]
  }

  constructor() {
    this.data = {
      reason: null!,
      isCancelled: false,
      listeners: []
    }
  }

  /**  cancel  :signals cancel for all tokens issued by this source */
  public cancel(reason: string) {
    this.data.isCancelled = true
    this.data.reason = reason
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < this.data.listeners.length; i++) {
      if (typeof this.data.listeners[i] === 'function') {
        this.data.listeners[i](reason)
      }
    }
  }

  public get token() {
    return new Token(this)
  }

  public get isCancelled() {
    return this.data.isCancelled
  }

  public get reason() {
    return this.data.reason
  }

  public register(cb: (reason: string) => void) {
    this.data.listeners.push(cb)
  }
}

/** Helper Method to return a Cancellation Token */
export class Token implements CancellationToken {
  private source: TokenSource

  constructor(source: TokenSource) {
    this.source = source
  }

  get isCancelled() {
    return this.source.isCancelled
  }

  onCancelled(callback: (reason: string) => void) {
    this.source.register(callback)
  }

  throwIfCancelled() {
    if (this.isCancelled) {
      throw new Error(this.source.reason)
    }

    this.onCancelled((reason) => {
      throw new Error(reason)
    })
  }
}

export const empty = Object.freeze(new TokenSource().token)

export default TokenSource
