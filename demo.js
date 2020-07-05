/*
 * Internet Open Protocol Abstraction (IOPA)
 * Copyright (c) 2016 Internet Open Protocol Alliance
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

import { App, Factory } from './dist/index'

const IopaApp = App
const iopaFactory = new Factory('demo', 100)

const test = new IopaApp()
let seq = 0
test.use((context, next) => {
  if (seq++ === 0) {
    context.setCapability('urn:io.iopa:demo', 'will only survive one record')
    context.capability('urn:io.iopa:app').notused = 'delete me'
  }
  console.log.info(context.toString())
  return next()
})

test.use((next) => {
  this.log.info('HELLO WORLD')
  return Promise.resolve('DONE') // stop processing in chain
})

const demo = test.build()
demo.listen()

let context = iopaFactory.createContext()
context.get('iopa.Method') = 'GET'
context.get('iopa.Path') = '/test'
context.get('iopa.Body') = { hello: 'world' }

context.using(demo)

context = iopaFactory.createContext()

demo(context)

context.dispose()
console.log(`DISPOSED ${context.toString()}`)
