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

import { FC, App } from 'iopa-types'

/** Assures that the middleware is represented as IOPA middleware promise format (promise) fn(context, next)  where next = (promise) function()  */
export default function Middleware(
    app: App<any, any>,
    middleware: any,
    action: 'invoke' | 'dispatch' = 'invoke'
): FC {
    let args

    if (typeof middleware === 'function') {
        switch (middleware.length) {
            //
            // fn() with this=app and fn.invoke(next) with this = context
            //
            case 0:
                middleware.call(app)
                return (context, next) => {
                    return middleware.invoke.call(context, next)
                }
                break

            //
            // fn(next) or fn(app) and fn.invoke(context, next)
            //
            case 1:
                args = _getParamNames(middleware)
                if (arrayEqual(args, ['next'])) {
                    return (context, next) => {
                        return middleware.call(context, next)
                    }
                }

                // eslint-disable-next-line no-case-declarations
                // eslint-disable-next-line
        const mw = new middleware(app)
                return mw.invoke.bind(mw)

            //
            // fn(req,res) or fn(context, next)
            //
            case 2:
                args = _getParamNames(middleware)
                if (arrayEqual(args, ['req', 'res'])) {
                    throw new Error(
                        "must require 'iopa-connect' to use Connect/Express style middleware"
                    )
                } else {
                    return middleware
                }

            //
            // fn(req,res,next)
            //
            case 3:
                throw new Error(
                    "must require 'iopa-connect' to use Connect/Express style middleware"
                )

            //
            // fn(err,req,res,next)
            //
            case 4:
                throw new Error(
                    "must require 'iopa-connect' to use Connect/Express style middleware"
                )

            default:
                throw new Error('unknown middleware')
        }
    } else {
        console.error('middleware must be a function')
        throw new Error('middleware must be called on a function')
    }
}

// PRIVATE HELPER FUNCTIONS
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm

/** Gets the parameter names of a javascript function */
function _getParamNames(func: Function) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '')
    let result = fnStr
        .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
        .match(/([^\s,]+)/g)
    if (result === null) {
        result = []
    }
    return result
}

/** Check if two arrays have same elements */
function arrayEqual(array1: Array<any>, array2: Array<any>) {
    // if the other array is a falsy value, return
    if (!array2) {
        return false
    }

    // compare lengths - can save a lot of time
    if (array1.length !== array2.length) {
        return false
    }

    // eslint-disable-next-line no-plusplus
    for (let i = 0, l = array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array1[i].compare(array2[i])) {
                return false
            }
        } else if (array1[i] !== array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false
        }
    }
    return true
}
