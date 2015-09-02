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
 
 const EventEmitter = require('events').EventEmitter,
    Stream = require('stream'),
    Readable = Stream.Readable,
    Writable = Stream.Writable,
    util = require('util'),

    constants = require('./constants'),
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,
    METHODS = constants.METHODS,
    PORTS = constants.PORTS,
    SCHEMES = constants.SCHEMES,
    PROTOCOLS = constants.PROTOCOLS,
    APP = constants.APP,
    COMMONKEYS = constants.COMMONKEYS,
    OPAQUE = constants.OPAQUE,
    WEBSOCKET = constants.WEBSOCKET,
    SECURITY = constants.SECURITY,
            
    shallow = require('../util/shallow'),
    merge = shallow.merge,
    copy = shallow.copy,
    clone = shallow.clone,
    cloneFilter = shallow.cloneFilter;
 
 var dog = IOPA.ad
 
/**
 * Extend Context Prototype
 *
 * @method init
 * @returns (void)
 * @private
 */
 function PrototypeExtend(context) {
     var context_prototype = Object.getPrototypeOf(context);
 
     // Put Stream/EventEmitter methods on context to proxy context["iopa.Body"] methods
     _cloneBodyPrototypeAlias(context_prototype, EventEmitter.prototype, IOPA.Body);
     _cloneBodyPrototypeAlias(context_prototype, Stream.prototype, IOPA.Body);
     _cloneBodyPrototypeAlias(context_prototype, Readable.prototype, IOPA.Body);
     _cloneBodyPrototypeAlias(context_prototype, Writable.prototype, IOPA.Body);

     // Put Header methods on context to proxy context["iopa.Header"] methods (note assume context and context.response share prototype)
     context_prototype.writeHead = function () { this[IOPA.WriteHead].apply(this, Array.prototype.slice.call(arguments)); };
     context_prototype.getHeader = function () { this[IOPA.GetHeader].apply(this, Array.prototype.slice.call(arguments)); };
     context_prototype.removeHeader = function () { this[IOPA.RemoveHeader].apply(this, Array.prototype.slice.call(arguments)); };
     context_prototype.setHeader = function () { this[IOPA.SetHeader].apply(this, Array.prototype.slice.call(arguments)); };

     context_prototype.toString = function () {
         
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

     context_prototype[IOPA.WriteHead] = function iopa_WriteHead(statusCode, headers) {
         this[IOPA.StatusCode] = statusCode;

         var keys = Object.keys(headers);
         for (var i = 0; i < keys.length; i++) {
             var k = keys[i];
             if (k) {
                 this[IOPA.SetHeader].call(this, k, headers[k]);
             }
         }
     };

     context_prototype[IOPA.SetHeader] = function iopa_SetHeader(key, val) {
         _setIgnoreCase(this[IOPA.Headers], key, val);
     }

     context_prototype[IOPA.GetHeader] = function iopa_GetHeader(key) {
         return _getIgnoreCase(this[IOPA.Headers], key);
     }

     context_prototype[IOPA.RemoveHeader] = function iopa_RemoveHeader(key, value) {
         return _deleteIgnoreCase(this[IOPA.Headers], key);
     }    
 }
 
 
 /**
  * DEFAULT EXPORT
  */
 exports.default = PrototypeExtend;
 
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

 // PRIVATE HELPERS

 /**
  * Create alias access methods on context.response for context body elemeent for given stream/readable/writable prototype
  *
  * Note: the alias will be a collection of both functions (which simply shell out to target function) and valuetypes (which
  * have a getter and setter defined which each shell out to the target property)
  *
  * @method _cloneBodyPrototypeAlias
  *
  * @param targetObjectPrototype (__proto__)  the prototype object for the context.response object on which the alias properties are set
  * @param sourceObjectprototype (__proto__)  the prototpye object for the generic stream/writable on which to enumerate all properties
  * @param iopaContextKey (string) e.g., "iopa.Body" 
  * @returns (void)
  * @private
  */
 function _cloneBodyPrototypeAlias(targetObjectPrototype, sourceObjectprototype, iopaContextKey) {
     Object.getOwnPropertyNames(sourceObjectprototype).forEach(function (_property) {
         if (typeof (sourceObjectprototype[_property]) === 'function') {
             targetObjectPrototype[_property] = function () {
                 var body = this[iopaContextKey];
                 return body[_property].apply(body, Array.prototype.slice.call(arguments));
             };
         }
         else {
             Object.defineProperty(targetObjectPrototype, _property, {

                 get: function () {
                     return this[iopaContextKey][_property];
                 },

                 set: function (val) {
                     this[iopaContextKey][_property] = val;
                 }

             });
         }
     });

 }
