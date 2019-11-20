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
import cloneKeyBehaviors from './util/prototype'
import {
  TokenSource as CancellationTokenSource,
  Token as CancellationToken
} from './util/cancellation'
import * as constants from './iopa/constants'
import { Disposable, EventEmitter } from './util/events'
import App from './appBuilder/appBuilder'
import Factory from './iopa/factory'
import { ContextBase, ResponseBase } from './iopa/context'
import IopaMap from './iopa/map'

export { App, IopaMap, ContextBase, ResponseBase, Factory, constants }

export { IopaContext as Context, FC } from 'iopa-types'

export const iopaPrototype = {
  cloneKeyBehaviors
}

export const util = {
  shallow,
  prototype: iopaPrototype,
  Disposable,
  EventEmitter,
  CancellationToken,
  CancellationTokenSource
}
