/*
 * Copyright (c) 2015 Limerun Project Contributors
 * Portions Copyright (c) 2015 Internet of Protocols Assocation (IOPA)
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

/*
 * Module dependencies.
 */
var Promise = require('bluebird');

/**
 * Assures that the middleware is represented as IOPA middleware promise format (promise) fn(context, next)  where next = (promise) function()
 *
 * @method Middleware
 * @param properties (object)  the appBuilder properties dictionary which will contain at least "server.Capabilities"
 * @param middleware (function)  the function which may already be in IOPA format or may be an Express/Connect middleware component
 * @returns (function)   the same middleware, wrapped as needed, to assure it is a (promise) function(next)
 */
function Middleware(app, middleware){
    var args;
    if (typeof middleware === 'function')
    {
        switch(middleware.length)
        {
                //fn() with this=app   and fn.invoke(next) with this = context
            case 0:
                middleware.call(app);
                return function middleware_invoker0(context, next) {
                     return middleware.invoke.call(context, next);
                   };
               
                //fn(next) or fn(app) and fn.invoke(context, next) 
            case 1:
                args =private_getParamNames(middleware);
                 if (arrayEqual(args,["next"]))
                 {
                   return function middleware_invoker1(context, next) {
                      return middleware.call(context, next);
                   };
                 }
                 else
                 {
                    var mw = Object.create(middleware.prototype); 
                    middleware.call(mw, app);
                    return mw.invoke.bind(mw);        
                 }
                  
                //fn(req,res) or fn(context, next)
            case 2:
                
                args =private_getParamNames(middleware);
                if (arrayEqual(args,["req","res"]))
                {
                    return promiseFromConnect2(middleware);
                } else
                   {
                     return middleware;
                 }
                 
                //fn(req,res,next)
            case 3:
                return promiseFromConnect3(middleware);
                
                //fn(err,req,res,next)
            case 4:
                return promiseFromConnect4(middleware);
                
            default:
                throw("unknown middleware");
                this.invoke = middleware;
        }
    }
    else
    {
        console.log("middleware must be a function");
        throw("middleware must be called on a function");
    }
    
};

module.exports = Middleware;

// PRIVATE HELPER FUNCTIONS

/**
 * Gets the parameter names of a javascript function
 *
 * @method private_getParamNames
 * @param func (function)  the function to parse
 * @returns (array[string])   the names of each argument (e.g., function (a,b) returns ['a', 'b']
 * @private
 */
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function private_getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '')
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
    if(result === null)
        result = []
        return result
        }

/**
 * Converts an IOPA promise-based Next() function  to an synchronous Connect-style Next() function
 *
 * @method arrayEqual
 *
 * @param array1 (Array[string])  the first array to compare
 * @param array2 (Array[string])  the second array to compare
 * @returns  (bool) true if the two arrays are equal, false if not  (e.g., ['a', 'c'], ['a', 'c'] is true)
 * @private
 */
function arrayEqual (array1, array2) {
    // if the other array is a falsy value, return
    if (!array2)
        return false;
    
    // compare lengths - can save a lot of time
    if (array1.length != array2.length)
        return false;
    
    for (var i = 0, l=array1.length; i < l; i++) {
        // Check if we have nested arrays
        if (array1[i] instanceof Array && array2[i] instanceof Array) {
            // recurse into the nested arrays
            if (!array1[i].compare(array2[i]))
                return false;
        }
        else if (array1[i] != array2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}

/**
 * Converts an Connect Func to an IOPA AppFunc
 *
 * @method promiseFromConnect2
 *
 * @param (void) fn(req,res)    with next ignored
 * @returns (promise) fn()
 * @private
 */
function promiseFromConnect2(fn) {
    return function convertedPromiseFromConnect2(context) {
        return new Promise(function (resolve, reject) {
                           try {
                           fn.call(context, context.req, context.res);
                           context = null;
                           resolve(null);
                           } catch (ex) {
                           reject(ex);
                           }
                           });
    };
}

/**
 * Converts a Connect NextFunc to an IOPA AppFunc
 *
 * @method promiseFromConnect3
 *
 * @param (void) fn(req, res, next)
 * @returns (promise) fn(next)  with next translated from (promise) function() to (void) function()
 * @private
 */
function promiseFromConnect3(fn) {
    return function convertedPromiseFromConnect2(context, next) {
        var nextAdjusted = nextSyncFromIopaNextPromise(next);
        return new Promise(function (resolve, reject) {
                           try {
                           fn.call(context, context.req, context.res, nextAdjusted);
                           context = null;
                           nextAdjusted = null;
                           resolve(null);
                           } catch (ex) {
                           reject(ex);
                           }
                           });
    };
}

/**
 * Converts an IOPA NodeFunc to an IOPA AppFunc
 *
 * @method promiseFromConnect4
 *
 * @param (void) fn(err, req, res, next)
 * @returns (promise) fn(next) with next translated from (promise) function() to (void) function()
 * @private
 */
function promiseFromConnect4(fn) {
    return function convertedPromiseFromConnect2(context, next) {
        var nextAdjusted = nextSyncFromIopaNextPromise(next);
        return new Promise(function (resolve, reject) {
                           try {
                           fn.call(context, context["iopa.Error"], context.req, context.res, nextAdjusted);
                           context = null;
                           nextAdjusted= null;
                           resolve(null);
                           } catch (ex) {
                           reject(ex);
                           }
                           });
    };
}

/**
 * Converts an IOPA promise-based Next() function  to an synchronous Connect-style Next() function
 *
 * @method nextSyncFromIopaNextPromise
 *
 * @param (promise) fn()
 * @returns  (void) fn(err)
 * @private
 */
function nextSyncFromIopaNextPromise(fn) {
    return function NextConvertedFromPromiseSync(err) {
        if (err)
        {
            this["iopa.Error"] = err;   // store err for subsequent Connect error handlers
            fn.call(this).then();
        }
        else
            fn.call(this).then();
    }
}
