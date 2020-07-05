/* eslint-disable  */
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

import { IopaRequestBase } from 'iopa-types'

export function merge(target: any, defaults: any, replace?: boolean) {
  if (!target) {
    throw new Error('target must not be empty')
  }

  if (!defaults) {
    defaults = {}
  }

  if (replace) {
    for (var key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        target[key] = defaults[key]
      }
    }
  } else {
    for (var key in defaults) {
      if (defaults.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
        target[key] = defaults[key]
      }
    }
  }
}

export function assign(target: any) {
  if (!target) {
    throw new Error('target must not be empty')
  }

  target = Object(target)
  for (let index = 1; index < arguments.length; index++) {
    const source = arguments[index]
    if (source != null) {
      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
  }
  return target
}

export function copy(source: any, target: any) {
  if (!source) {
    source = {}
  }

  if (!target) {
    target = Object.create(Object.getPrototypeOf(source))
  }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key]
    }
  }

  return target
}

export function clone(source: any) {
  const clone = Object.create(Object.getPrototypeOf(source))

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      clone[key] = source[key]
    }
  }

  return clone
}

export function cloneDoubleLayer(source: any) {
  const clone = Object.create(Object.getPrototypeOf(source))

  for (const key1 in source) {
    if (source.hasOwnProperty(key1)) {
      const item = source[key1]
      if (typeof item === 'object') {
        const targetItem = Object.create(Object.getPrototypeOf(item))

        for (const key2 in item) {
          if (item.hasOwnProperty(key2)) {
            targetItem[key2] = item[key2]
          }
        }
        clone[key1] = targetItem
      } else {
        clone[key1] = item
      }
    }
  }

  return clone
}

export function cloneTripleLayer(source: any) {
  const clone = Object.create(Object.getPrototypeOf(source))

  for (const key1 in source) {
    if (source.hasOwnProperty(key1)) {
      const item = source[key1]
      if (typeof item === 'object') {
        const targetItem = Object.create(Object.getPrototypeOf(item))

        for (const key2 in item) {
          if (item.hasOwnProperty(key2)) {
            const item2 = item[key2]
            if (typeof item2 === 'object') {
              const targetItem2 = Object.create(Object.getPrototypeOf(item2))

              for (const key3 in item2) {
                if (item2.hasOwnProperty(key3)) {
                  targetItem2[key3] = item[key3]
                }
              }
              targetItem[key2] = targetItem2
            } else {
              targetItem[key2] = item2
            }
          }
        }
        clone[key1] = targetItem
      } else {
        clone[key1] = item
      }
    }
  }

  return clone
}

export function cloneFilter(source: any, blacklist: string[]) {
  const clone = Object.create(Object.getPrototypeOf(source))

  for (const key in source) {
    if (source.hasOwnProperty(key) && blacklist.indexOf(key) == -1) {
      clone[key] = source[key]
    }
  }

  return clone
}

export function mergeContext(target: any, defaults: Partial<IopaRequestBase>) {
  if (!target) {
    throw new Error('target must not be empty')
  }

  if (!defaults) {
    return
  } // nothing to do

  Object.keys(defaults).forEach((key: keyof IopaRequestBase) => {
    if (key !== 'iopa.Headers') {
      target[key] = defaults[key]
    } else {
      const targetHeaders = target[key] || {}
      const sourceHeaders = defaults[key]!

      Object.keys(sourceHeaders).forEach(headerkey => {
        targetHeaders[headerkey] = sourceHeaders[headerkey]
      })

      target[key] = targetHeaders
    }
  })
}
