/*
 * Internet Open Protocol Abstraction (IOPA)
 * Copyright (c) 2016 Internet of Protocols Alliance
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

import * as shallow from './util/shallow'
import { cloneKeyBehaviors } from './util/prototype'
import { default as CancellationTokenSource } from './util/cancellation'
import * as constants from './iopa/constants'

import { default as App } from './appBuilder/appBuilder'
import { default as Factory } from './iopa/factory'

export { App, Factory, constants, shallow}

export const iopaPrototype = {
  cloneKeyBehaviors
}

export const util = {
  shallow,
  prototype: iopaPrototype,
  CancellationTokenSource
}

export interface Context {
  [key: string]: any
}

export declare class Component {
  /** constructor called once upon registration */
  constructor(app?: App)

  /** invoke function called for every reading  */
  invoke: (context: Context, next?: () => Promise<any>) => Promise<any>
}

export type FC = (context: Context, next: () => Promise<void>) => Promise<void>

export type Invoker = (context: Context) => Promise<void>

export type Middleware = FC | Component

export interface AppProperties {
  'server.AppId': string
  'server.Capabilities': any
  'server.Logger': Console
  'server.Pipeline': FC
  'app.DefaultApp': Middleware
  'app.DefaultMiddleware': Middleware
}

interface IApp {
  properties: AppProperties
  log: Console
  use: (Middleware) => this
  build: () => Invoker
  onReady?: () => void
}

export default {
  App,
  Factory,
  constants,
  shallow,
  iopaPrototype,
  util
}