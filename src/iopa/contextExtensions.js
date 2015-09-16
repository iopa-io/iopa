/*
 * Copyright (c) 2015 Internet of Protocols Alliance (IOPA)
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
 
 const EventEmitter = require('events').EventEmitter,
    Stream = require('stream'),
    Readable = Stream.Readable,
    Writable = Stream.Writable,
    util = require('util'),

    constants = require('./constants'),
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,
             
    cloneFilter = require('../util/shallow').cloneFilter,
    cloneKeyBehaviors = require('../util/prototype').cloneKeyBehaviors;
 
/**
 * Extend Context Prototype
 *
 * @method init
 * @returns (void)
 * @private
 */
 function PrototypeExtend(contextPrototype) {
     // Put Stream/EventEmitter methods on context to proxy context["iopa.Body"] methods
     cloneKeyBehaviors(contextPrototype, EventEmitter.prototype, IOPA.Body, false);
     cloneKeyBehaviors(contextPrototype, Stream.prototype, IOPA.Body, false);
     cloneKeyBehaviors(contextPrototype, Readable.prototype, IOPA.Body, false);
     cloneKeyBehaviors(contextPrototype, Writable.prototype, IOPA.Body, true);

     // Put Header methods on context to proxy context["iopa.Header"] methods (note assume context and context.response share prototype)
     contextPrototype.writeHead = function () { this[IOPA.WriteHead].apply(this, Array.prototype.slice.call(arguments)); };
     contextPrototype.getHeader = function () { this[IOPA.GetHeader].apply(this, Array.prototype.slice.call(arguments)); };
     contextPrototype.removeHeader = function () { this[IOPA.RemoveHeader].apply(this, Array.prototype.slice.call(arguments)); };
     contextPrototype.setHeader = function () { this[IOPA.SetHeader].apply(this, Array.prototype.slice.call(arguments)); };

     contextPrototype.toString = function () {
         
      //  return JSON.stringify(this, null, 4)
         return util.inspect(cloneFilter(this, 
             [SERVER.CallCancelledSource, 
                 IOPA.CallCancelled, 
                 SERVER.Logger, 
                 "log", 
                 "response",
                  IOPA.Events,
                  ]));
         
         ; //.replace(/\n/g, "\r");
     }

     contextPrototype[IOPA.WriteHead] = function iopa_WriteHead(statusCode, headers) {
         this[IOPA.StatusCode] = statusCode;

         var keys = Object.keys(headers);
         for (var i = 0; i < keys.length; i++) {
             var k = keys[i];
             if (k) {
                 this[IOPA.SetHeader].call(this, k, headers[k]);
             }
         }
     };

     contextPrototype[IOPA.SetHeader] = function iopa_SetHeader(key, val) {
         _setIgnoreCase(this[IOPA.Headers], key, val);
     }

     contextPrototype[IOPA.GetHeader] = function iopa_GetHeader(key) {
         return _getIgnoreCase(this[IOPA.Headers], key);
     }

     contextPrototype[IOPA.RemoveHeader] = function iopa_RemoveHeader(key, value) {
         return _deleteIgnoreCase(this[IOPA.Headers], key);
     }    
     
     Object.defineProperty(contextPrototype, "log", {
                       get: function () { return  this[SERVER.Logger] ;
                       }  });
                       
     contextPrototype.using = function(appFuncPromiseOrValue){
         if (typeof(appFuncPromiseOrValue) === 'function')
            return _using(this, appFuncPromiseOrValue(this));
         else
           return _using(this, appFuncPromiseOrValue);
     }          
 }
 
 /*
* ES6 finally/dispose pattern for IOPA Context
* @param context Iopa
* @param p Promise or value
* returns Promise that always ultimately resolves to callback's result or rejects
*/
function _using(context, p) {

    /**  bluebird version only -- not used:
    *  	 return Promise.using(Promise.resolve(context)
    *	 .disposer(function(context, promise){
    *		  context.dispose();
              context = null; 
    *	 }), cb);
    */

    return new Promise(function (resolve, reject) {
       if (typeof p === 'undefined')
            p = null;
        resolve(p);
    }).then(function (value) {
        return Promise.resolve(function () {
            process.nextTick(context.dispose);
            return value;
        } ());
    },
        function (err) {
            context.log.error(err);
            process.nextTick(context.dispose);
            throw err;
    });
};
 
 
 /**
  * DEFAULT EXPORT
  */
 exports.addTo = PrototypeExtend;
 
 /**
  * Adds or updates a javascript object, case insensitive for key property
  *
  * @method private_setIgnoreCase
  * @param obj (object)  the object to search
  * @param key (string) the new or existing property name
  * @param val (string) the new property value
  * @private
  */
 function _setIgnoreCase(obj, key, val) {
     key = key.toLowerCase();
     for (var p in obj) {
         if (obj.hasOwnProperty(p) && key == p.toLowerCase()) {
             obj[p] = val;
             return;
         }
     }
     obj[key] = val;

 }

 /**
  * Returns a javascript object, case insensitive for key property
  *
  * @method private_setIgnoreCase
  * @param obj (object)  the object to search
  * @param key (string) the new or existing property name
  * @param val (string) the new property value
  * @private
  */
 function _getIgnoreCase(obj, key) {
     key = key.toLowerCase();
     for (var p in obj) {
         if (obj.hasOwnProperty(p) && key == p.toLowerCase()) {
             return obj[p];
         }
     }
     return null;
 }

 /**
  * Returns a javascript object, case insensitive for key property
  *
  * @method private_setIgnoreCase
  * @param obj (object)  the object to search
  * @param key (string) the new or existing property name
  * @return (bool) true if successful, false if not
  * @private
  */
 function _deleteIgnoreCase(obj, key) {
     key = key.toLowerCase();
     for (var p in obj) {
         if (obj.hasOwnProperty(p) && key == p.toLowerCase()) {
             delete obj[p];
             return true;
         }
     }
     return false;
 }

