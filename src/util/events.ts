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

export default class EventEmitter {
  private events: { [key: string]: Function[] }

  constructor() {
    this.events = {}
  }

  on(event: string, listener: Function) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = []
    }

    this.events[event].push(listener)
  }

  removeListener(event: string, listener: Function) {
    var idx

    if (typeof this.events[event] === 'object') {
      idx = indexOf(this.events[event], listener)

      if (idx > -1) {
        this.events[event].splice(idx, 1)
      }
    }
  }

  emit(event: string) {
    var i,
      listeners,
      length,
      args = [].slice.call(arguments, 1)

    if (typeof this.events[event] === 'object') {
      listeners = this.events[event].slice()
      length = listeners.length

      for (i = 0; i < length; i++) {
        listeners[i].apply(this, args)
      }
    }
  }

  once(event: string, listener: Function) {
    const g = (...args) => {
      this.removeListener(event, g)
      listener.apply(this, args)
    }

    this.on(event, g)
  }
}

/* Polyfill indexOf. */
let indexOf

if (typeof Array.prototype.indexOf === 'function') {
  indexOf = function(haystack, needle) {
    return haystack.indexOf(needle)
  }
} else {
  indexOf = function(haystack, needle) {
    var i = 0,
      length = haystack.length,
      idx = -1,
      found = false

    while (i < length && !found) {
      if (haystack[i] === needle) {
        idx = i
        found = true
      }

      i++
    }

    return idx
  }
}
