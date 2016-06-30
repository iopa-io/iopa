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

const cloneKeyBehaviors = require('../util/prototype').cloneKeyBehaviors,
    constants = require('./constants'),
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,
 
    EventEmitter = require('events').EventEmitter,
    Stream = require('stream'),
    Readable = Stream.Readable,
    Writable = Stream.Writable,
  
/**
 * Extend Context Prototype
 *
 * @method init
 * @returns (void)
 * @private
 */
 function PrototypeExtendREST(contextPrototype) {
     // Put Stream/EventEmitter methods on context to proxy context["iopa.Body"] methods
    
     cloneKeyBehaviors(contextPrototype, EventEmitter.prototype, IOPA.Body, false);
     cloneKeyBehaviors(contextPrototype, Stream.prototype, IOPA.Body, false);
     cloneKeyBehaviors(contextPrototype, Readable.prototype, IOPA.Body, false);
     cloneKeyBehaviors(contextPrototype, Writable.prototype, IOPA.Body, true);
     
     contextPrototype.write = function () { 
         this[IOPA.Body].write.apply(this[IOPA.Body], Array.prototype.slice.call(arguments)); 
         return this;
         };
    
     contextPrototype.end = function () { 
         this[IOPA.Body].end.apply(this[IOPA.Body], Array.prototype.slice.call(arguments)); 
         return this;
         };
         
     contextPrototype.complete  = function () { 
       var context = this;
       
       return new Promise(function(resolve, reject){
      
         context[IOPA.Body].once("sent", function(){
             process.nextTick(context.dispose);
             context = null;
             resolve();
         });
       
         context[IOPA.Body].end.apply(context[IOPA.Body], Array.prototype.slice.call(arguments)); 
       });
     }; 
        
     // Put Header methods on context to proxy context["iopa.Header"] methods (note assume context and context.response share prototype)
     contextPrototype.writeHead = function () { this[IOPA.WriteHead].apply(this, Array.prototype.slice.call(arguments)); };
     contextPrototype.getHeader = function () { return this[IOPA.GetHeader].apply(this, Array.prototype.slice.call(arguments)); };
     contextPrototype.removeHeader = function () { return this[IOPA.RemoveHeader].apply(this, Array.prototype.slice.call(arguments)); };
     contextPrototype.setHeader = function () { return this[IOPA.SetHeader].apply(this, Array.prototype.slice.call(arguments)); };
     contextPrototype.set = function () { return this[IOPA.Set].apply(this, Array.prototype.slice.call(arguments)); };
     contextPrototype.fn = function () { return this[IOPA.Function].apply(this, Array.prototype.slice.call(arguments)); };

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
     
    contextPrototype[IOPA.Set] = function iopa_set(key, val) {
         this[key] = val;
         return this;
     }
     
    contextPrototype[IOPA.Function] = function iopa_fn(fn) {
         return fn(this);
     }

     contextPrototype[IOPA.SetHeader] = function iopa_SetHeader(key, val) {
         _setIgnoreCase(this[IOPA.Headers], key, val);
         return this;
     }

     contextPrototype[IOPA.GetHeader] = function iopa_GetHeader(key) {
         return _getIgnoreCase(this[IOPA.Headers], key);
     }

     contextPrototype[IOPA.RemoveHeader] = function iopa_RemoveHeader(key, value) {
          _deleteIgnoreCase(this[IOPA.Headers], key);
          return this;
     }           
 }
 
 
 /**
  * DEFAULT EXPORT
  */
 exports.addTo = PrototypeExtendREST;
 
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
     var key_lower = key.toLowerCase();
     for (var p in obj) {
         if (obj.hasOwnProperty(p) && key_lower == p.toLowerCase()) {
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

