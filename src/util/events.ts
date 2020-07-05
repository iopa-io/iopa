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

import { Disposer, Listener, IDisposable, IEventEmitter } from 'iopa-types'

/* Polyfill EventEmitter. */

export class Disposable implements IDisposable {
  private disposer: Disposer

  constructor(disposer: Disposer) {
    this.disposer = disposer
  }

  dispose() {
    this.disposer.apply(this.disposer)
  }
}

export class DisposablesComposite {
  private disposables: Set<Disposable>

  constructor() {
    this.disposables = new Set()
  }

  add(disposable: Disposable) {
    this.disposables.add(disposable)
    return disposable
  }

  dispose() {
    this.disposables.forEach((disposable) => {
      disposable.dispose.apply(disposable)
    })
  }
}

export class EventEmitter implements IEventEmitter {
  public listeners: Map<string, Set<Listener>>

  public onceListeners: Map<string, Set<Listener>>

  constructor() {
    this.listeners = new Map()
    this.onceListeners = new Map()
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((cb) => cb(...args))
    }
    const onceCallbacks = this.onceListeners.get(event)
    if (onceCallbacks) {
      onceCallbacks.forEach((cb) => cb(...args))
      this.onceListeners.delete(event)
    }
  }

  on(event: string, cb: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    const existing = this.listeners.get(event)!
    existing.add(cb)
    return new Disposable(() => {
      existing.delete(cb)
    })
  }

  once(event: string, cb: Listener) {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set())
    }
    const existing = this.onceListeners.get(event)!
    existing.add(cb)
    return new Disposable(() => {
      existing.delete(cb)
    })
  }

  emitWithReturn<K>(event: string, ...args: any[]): K[] {
    const callbacks = Array.from(this.listeners.get(event) || [])
    return callbacks.map((cb) => cb(...args))
  }

  clear(event?: string) {
    if (event) {
      this.listeners.delete(event)
      this.onceListeners.delete(event)
    } else {
      this.listeners.clear()
      this.onceListeners.clear()
    }
  }
}
