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

/*
 * Module dependencies.
 */

/**
 * Assures that the middleware is represented as IOPA middleware promise format (promise) fn(context, next)  where next = (promise) function()
 *
 * @method Middleware
 * @param app (object)  the appBuilder instance which will contain at least "server.Capabilities"
 * @param middleware (function)  the function which may already be in IOPA format or may be an Express/Connect middleware component
 * @returns (function)   the same middleware, wrapped as needed, to assure it is a (promise) function(next)
 */
function Middleware(app, middleware, action){
    var args;
    action = action || "invoke";
    
    if (typeof middleware === 'function')
    {
        switch(middleware.length)
        {
                //fn() with this=app   and fn.invoke(next) with this = context
            case 0:
                middleware.call(app);
                return function (context, next) {return middleware.invoke.call(context, next);};
                break;
               
                //fn(next) or fn(app) and fn.invoke(context, next) 
            case 1:
                args =private_getParamNames(middleware);
                 if (arrayEqual(args,["next"]))
                   return function (context, next) { return middleware.call(context, next);}; 
                
                 else
                 {
                    var mw = Object.create(middleware.prototype); 
                    middleware.call(mw, app);
                   
                    return mw.invoke.bind(mw);
                 
                    if (typeof mw[action] === 'function')
                       return mw[action].bind(mw);
                    else
                       throw("no " + action +" function exists on middleware " + middleware.toString());
                       
                  }
                
                //fn(req,res) or fn(context, next)
            case 2:      
                args =private_getParamNames(middleware);
                if (arrayEqual(args,["req","res"]))
                {
                    throw("must require 'iopa-connect' to use Connect/Express style middleware");
                } else
                {
                    return middleware;
                }
                 
                //fn(req,res,next)
            case 3:
                 throw("must require 'iopa-connect' to use Connect/Express style middleware");
                  
                //fn(err,req,res,next)
            case 4:
                 throw("must require 'iopa-connect' to use Connect/Express style middleware");
             
            default:
                throw("unknown middleware");
        
        }
    }
    else
    {
        app.log.error("middleware must be a function");
        throw("middleware must be called on a function");
    }
    
};


 /**
  * DEFAULT EXPORT
  */
exports.default = Middleware;

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
 * Check if two arrays have same elements
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
