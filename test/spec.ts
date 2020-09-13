/* eslint-disable no-prototype-builtins */
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

import * as iopa from '../src/index'

const { constants } = iopa
const { IOPA } = constants
const { SERVER } = constants

let app

describe('#IOPA()', () => {
    const factory = new iopa.Factory('TestFactory')

    test('should create empty context', () => {
        const context = factory.createContext()

        expect(context.hasOwnProperty(IOPA.Version)).toBe(true)
        expect(context.hasOwnProperty(SERVER.CancelToken)).toBe(true)
        expect(context.hasOwnProperty(IOPA.Events)).toBe(true)
        expect(context.hasOwnProperty(SERVER.Id)).toBe(true)
        expect(context.hasOwnProperty(SERVER.CancelTokenSource)).toBe(true)
        expect(context.hasOwnProperty(IOPA.Method)).toBe(true)
        expect(context.hasOwnProperty(IOPA.Body)).toBe(true)
        expect(context.hasOwnProperty(IOPA.Path)).toBe(true)
        expect(context.hasOwnProperty('IGNOREME')).toBe(false)
    })

    test('should create app that updates context using both signatures', () => {
        const test = new iopa.App()

        // use standard IOPA signature with context
        test.use((context, next) => {
            context[IOPA.Method] = 'GET'

            // continue to next middleware in pipeline
            return next()
        })

        test.use(
            class MW {
                private app

                constructor(app: iopa.App) {
                    this.app = app
                }

                invoke(context, next) {
                    expect(this.app)
                    expect(context[IOPA.Method]).toBe('GET')
                    context[IOPA.Method] = 'GET2'

                    return next()
                }
            }
        )

        const pseudoClass = function PseudoClass(this: any, app) {
            this.app = app
        }
        pseudoClass.prototype.invoke = (context, next) => {
            expect(context[IOPA.Method]).toBe('GET2')
            context[IOPA.Method] = 'PUT'

            // show as complete
            return Promise.resolve('ABC')
        }
        test.use(pseudoClass)

        app = test.build()
    })

    test('should call app with context updated', (done) => {
        const context = factory.createContext()

        app(context).then((value) => {
            expect(context[IOPA.Method]).toBe('PUT')
            context.dispose()
            expect(context[IOPA.Method] == null).toBe(true)
            expect(value).toBe('ABC')
            done()
        })
    })

    /**  test('should dispose context after running an AppFunc', done => {
    var context = factory.createContext()

    context.using(app).then(function(value) {
      expect(value).toBe('ABC')
      process.nextTick(function() {
        expect(context[IOPA.Method] == null).toBe(true)
        done()
      })
    })
  })

  test('should dispose context after satisfying a promise', done => {
    var context = factory.createContext()

    context
      .using(
        app(context).then(function(value) {
          expect(context[IOPA.Method]).toBe('PUT')
          return value
        })
      )
      .then(function(value) {
        process.nextTick(function() {
          expect(context[IOPA.Method] == null).toBe(true)
          expect(value).toBe('ABC')
          done()
        })
      })
  })
})

describe('#CancellationTokenSource()', () => {
  var tokensource, token

  test('should create new cancellation token', () => {
    tokensource = new iopaUtil.CancellationTokenSource()
    expect(tokensource.isCancelled).toBe(false)
  })

  test('should create new  token', () => {
    token = tokensource.token
    expect(token.isCancelled).toBe(false)
  })

  test('should register a callback and cancel a token', done => {
    token.onCancelled(function(reason) {
      expect(reason).toBe('EVENT REASON 126')
      process.nextTick(done)
    })
    tokensource.cancel('EVENT REASON 126')
    expect(token.isCancelled).toBe(true)
    expect(tokensource.isCancelled).toBe(true)
  })
  */
})
