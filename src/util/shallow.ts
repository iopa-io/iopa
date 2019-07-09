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

import { IOPA } from '../iopa/constants'

export function merge(target, defaults, replace?: boolean) {
  if (!target) throw new Error('target must not be empty')

  if (!defaults) defaults = {}

  if (replace) {
    for (var key in defaults) {
      if (defaults.hasOwnProperty(key)) target[key] = defaults[key]
    }
  } else {
    for (var key in defaults) {
      if (defaults.hasOwnProperty(key) && !target.hasOwnProperty(key))
        target[key] = defaults[key]
    }
  }
}

export function assign(target) {
  if (!target) throw new Error('target must not be empty')

  target = Object(target)
  for (var index = 1; index < arguments.length; index++) {
    var source = arguments[index]
    if (source != null) {
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
  }
  return target
}

export function copy(source, target) {
  if (!source) source = {}

  if (!target) target = {}

  for (var key in source) {
    if (source.hasOwnProperty(key)) target[key] = source[key]
  }

  return target
}

export function clone(source) {
  var clone = {}

  for (var key in source) {
    if (source.hasOwnProperty(key)) clone[key] = source[key]
  }

  return clone
}

export function cloneDoubleLayer(source) {
  var clone = {}

  for (var key1 in source) {
    if (source.hasOwnProperty(key1)) {
      var item = source[key1]
      if (typeof item == 'object') {
        var targetItem = {}

        for (var key2 in item) {
          if (item.hasOwnProperty(key2)) targetItem[key2] = item[key2]
        }
        clone[key1] = targetItem
      } else clone[key1] = item
    }
  }

  return clone
}

export function cloneTripleLayer(source) {
  var clone = {}

  for (var key1 in source) {
    if (source.hasOwnProperty(key1)) {
      var item = source[key1]
      if (typeof item == 'object') {
        var targetItem = {}

        for (var key2 in item) {
          if (item.hasOwnProperty(key2)) {
            var item2 = item[key2]
            if (typeof item2 == 'object') {
              var targetItem2 = {}

              for (var key3 in item2) {
                if (item2.hasOwnProperty(key3)) {
                  targetItem2[key3] = item[key3]
                }
              }
              targetItem[key2] = targetItem2
            } else targetItem[key2] = item2
          }
        }
        clone[key1] = targetItem
      } else clone[key1] = item
    }
  }

  return clone
}

export function cloneFilter(source, blacklist: string[]) {
  var clone = {}

  for (var key in source) {
    if (source.hasOwnProperty(key) && blacklist.indexOf(key) == -1)
      clone[key] = source[key]
  }

  return clone
}

export function mergeContext(target, defaults) {
  if (!target) throw new Error('target must not be empty')

  if (!defaults) return // nothing to do

  for (var key in defaults) {
    if (defaults.hasOwnProperty(key) && key !== IOPA.Headers)
      target[key] = defaults[key]
  }

  if (defaults.hasOwnProperty(IOPA.Headers)) {
    var targetHeaders = target[IOPA.Headers] || {}
    var sourceHeaders = defaults[IOPA.Headers]

    for (var key in defaults[IOPA.Headers]) {
      if (sourceHeaders.hasOwnProperty(key))
        targetHeaders[key] = sourceHeaders[key]
    }

    target[IOPA.Headers] = targetHeaders
  }
}
