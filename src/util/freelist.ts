/**
 * Node 0.12.x - 4.0.x Freelist module
 *
 * Included without functional changes
 * just license notice added
 *
 * Simple function but has now been deprecated in Node.js but including here
 *
 * This license applies to this module only
 */

/**
 * Copyright Node.js contributors. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

// This is a free list to avoid creating so many of the same object.
export class FreeList<T> {
  name: string
  max: number
  _constructor: (...args) => T
  list: T[]

  constructor(name: string, max: number, factory: (...args) => T) {
    this.name = name
    this._constructor = factory
    this.max = max
    this.list = []
  }

  alloc() {
    return this.list.length
      ? this.list.shift()
      : this._constructor.apply(this, arguments)
  }

  free(obj: T) {
    if (this.list.length < this.max) {
      this.list.push(obj)
      return true
    }
    return false
  }
}
