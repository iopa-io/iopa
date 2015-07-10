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
var util = require('util');
var Stream = require('stream');
var EventEmitter = require('events').EventEmitter;
var Writable = Stream.Writable;
var Readable = Stream.Readable;

var constants = require('../util/constants.js');
var Shallow = require('../util/shallow.js');

var iopaConnect = require('./iopaConnect.js');

var guidFactory = require('../util/guid.js');
var iopaContextFactory = require('./iopaContextFactory.js');

/**
 * Run Once Self Initiating Function
 *
 * @method init
 * @returns (void)
 * @private
 */
(function  init() {
 var _context = iopaContextFactory.createContext();   // use for adding properties
 _helpers_refreshPrototype(_context, "iopa.", IopaIopa.prototype);
 _helpers_refreshPrototype(_context, "server.", IopaServer.prototype);
 
 var context_prototype = Object.getPrototypeOf(_context);
 
 _helpers_cloneBodyPrototypeAlias(context_prototype, EventEmitter.prototype, "iopa.Body");
 _helpers_cloneBodyPrototypeAlias(context_prototype, Stream.prototype, "iopa.Body");
 _helpers_cloneBodyPrototypeAlias(context_prototype, Readable.prototype, "iopa.Body");
 _helpers_cloneBodyPrototypeAlias(context_prototype, Writable.prototype, "iopa.Body");
  
 context_prototype.writeHead = function(){this["iopa.WriteHead"].apply(this, Array.prototype.slice.call(arguments));};
 context_prototype.getHeader = function(){this["iopa.GetHeader"].apply(this, Array.prototype.slice.call(arguments));};
 context_prototype.removeHeader = function(){this["iopa.RemoveHeader"].apply(this, Array.prototype.slice.call(arguments));};
 context_prototype.setHeader = function(){this["iopa.SetHeader"].apply(this, Array.prototype.slice.call(arguments));};
 
 iopaContextFactory.free(_context);
 _context = null;
 }).call(this);

// PUBLIC EXPORTS
/**
 * Expands IOPA context object with various helper methods;  called for every request context passing through IOPA
 *
 * @method private_refreshPrototype
 * @this appBuilder (object)  a representative IOPA context with all desired properties
 * @param context (dictionary)  the IOPA properties dictionary
 * @param addReqRes (function)  function to add req res methods
 * @returns (void)
 * @private
 */
exports.expandContext = function expandContext(context, addReqRes) {
    var isIopaNative = true;
    
    if (context.reqres)
        isIopaNative = false;
    
    context.iopa = new IopaIopa(context);
    context.server = new IopaServer(context);
    context["iopa.Id"] = guidFactory.guid();
    context["server.Capabilities"] = Shallow.copy(this.properties["server.Capabilities"], context["server.Capabilities"]);
    context["server.Logger"] = this.properties["server.Logger"];
    context.log = context["server.Logger"];

   if (!context["server.AppId"])
    {
         
        var context_prototype = Object.getPrototypeOf(context);
        
        // add default aliases to IopaContext if needed;  not currently in default IOPA spec
        // _helpers_refreshPrototypeIopaContext(context);
        
        Object.defineProperty(context_prototype, "server.AppId", {value : this.properties["server.AppId"],
                              writable : false, enumerable : true, configurable : false});
       
        context_prototype.toString = function()
        {
            return util.inspect(this).replace(/\n/g,"\r");
        }
        
        if (isIopaNative)
            initIopaNativeContextPrototype(context_prototype);
    }
    
   if (isIopaNative)
        iopaConnect.addReqRes(context);
};


/**
 * Representss an IOPA iopa Object
 *
 * @class IopaIopa
 * @constructor
 */
function IopaIopa(iopa){ this.context = iopa;  };


/**
 * Represents an IOPA server Object
 *
 * @class IopaServer
 * @constructor
 */
function IopaServer(iopa){ this.context = iopa;  };


/**
 * Run Once Self Initiating Function to create prototype methods on IopaIopa, IopaResponse, IopaServer etc.
 *
 * @method init
 * @returns (void)
 * @private
 */
(function initPrototypes(){
 Object.defineProperty(IopaIopa.prototype, "host", {   get: function () {
                       return this.context["iopa.GetHeader"]("host");
                       }});
 
 Object.defineProperty(IopaIopa.prototype, "originalUrl", {   get: function () {
                       var ctx = this.context;
                       var uri =
                       ctx["iopa.Scheme"] +
                       "://" +
                       ctx.host +
                       ctx["iopa.PathBase"] +
                       ctx["iopa.Path"];
                       
                       if (ctx["iopa.QueryString"] != "")
                       uri += "?" + ctx["iopa.QueryString"];
                       
                       return uri;
                       }});
 
 IopaIopa.prototype.writeHead= function(){this.context["iopa.WriteHead"].apply(this.context, Array.prototype.slice.call(arguments));};
 IopaIopa.prototype.getHeader= function(){this.context["iopa.GetHeader"].apply(this.context, Array.prototype.slice.call(arguments));};
 IopaIopa.prototype.removeHeader = function(){this.context["iopa.RemoveHeader"].apply(this.context, Array.prototype.slice.call(arguments));};
 IopaIopa.prototype.setHeader = function(){this.context["iopa.SetHeader"].apply(this.context, Array.prototype.slice.call(arguments));};
 IopaIopa.prototype.getHeader = function(){this.context["iopa.GetHeader"].apply(this.context, Array.prototype.slice.call(arguments));};

 }).call(this);


function initIopaNativeContextPrototype(contextPrototype){
    
    contextPrototype["iopa.WriteHead"] = function iopa_WriteHead(statusCode, headers)
    {
        this["iopa.StatusCode"] = statusCode;
        
        var keys = Object.keys(headers);
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (k)
            {
                this["Iopa.setResponseHeader"].call(this, k, headers[k]);
            }
        }
    };
    
    contextPrototype["iopa.SetHeader"] = function iopa_SetHeader(key, val)
    {
        private_setIgnoreCase(this["iopa.Headers"], key, val);
    }
    
    contextPrototype["iopa.GetHeader"] = function iopa_GetHeader(key)
    {
        return private_getIgnoreCase(this["iopa.Headers"], key);
    }
    
    contextPrototype["iopa.RemoveHeader"] = function iopa_RemoveHeader(key, value)
    {
          return private_deleteIgnoreCase(this["iopa.Headers"], key);
    }
   
}

/**
 * Adds or updates a javascript object, case insensitive for key property
 *
 * @method private_setIgnoreCase
 * @param obj (object)  the object to search
 * @param key (string) the new or existing property name
 * @param val (string) the new property value
 * @private
 */
function private_setIgnoreCase(obj, key, val)
{
     key = key.toLowerCase();
    for(var p in obj){
        if(obj.hasOwnProperty(p) && key == p.toLowerCase()){
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
function private_getIgnoreCase(obj, key)
{
    key = key.toLowerCase();
    for(var p in obj){
        if(obj.hasOwnProperty(p) && key == p.toLowerCase()){
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
function private_deleteIgnoreCase(obj, key)
{
    key = key.toLowerCase();
    for(var p in obj){
        if(obj.hasOwnProperty(p) && key == p.toLowerCase()){
            delete obj[p];
            return true;
        }
    }
    return false;
}

exports.shrinkContext = function(context) {
    if (context.iopa){
        delete context.iopa.context ;
        delete context.server.context ;
        delete context.req.context;
        delete context.res.context;
        
        delete context.iopa ;
        delete context.server ;
        delete context.req;
        delete context.res;
    }
}



// PRIVATE HELPERS

/**
 * Adds alias property accessors to IOPA context object for given IOPA category
 *     (e.g., request.pathBase for fn({"iopa.RequestPathBase": ""}, "iopa.Request", context.request.prototype))
 *
 * @method _helpers_refreshPrototype
 * @param propertyList (object)  a representative IOPA context with all desired properties set (to null, default or value)
 * @param iopaPrefix (string)  the IOPA  prefix to search for (e.g., "iopa.Request")
 * @param iopaObjectPrototype (object)  the javascript object on which to add the prototypes (e.g., context.request)
 * @returns (void)
 * @private
 */
function _helpers_refreshPrototype(propertyList, iopaPrefix, iopaObjectPrototype)
{
    Object.keys(propertyList).forEach(function (_property)
                                      {
                                     var suffix = private_getSuffix(iopaPrefix, _property);
                                      
                                      if (suffix)
                                      {
                                      if (suffix.length >1)
                                      suffix = suffix.substring(0,1).toLowerCase() + suffix.substring(1)
                                      else
                                      suffix = suffix.toLowerCase();
                                      
                                      
                                      Object.defineProperty(iopaObjectPrototype, suffix, {
                                                            
                                                            get: function () {
                                                            return this[_property];
                                                            },
                                                            
                                                            set: function (val) {
                                                            this[_property] = val;
                                                            }
                                                            
                                                            })
                                      }
                                      });
}

/**
 * Add alias properties to IOPA Context object  (e.g., context.Server from "Server.*")
 * NOT CURRENTLY USED
 *
 * @method _helpers_refreshPrototypeIopaContext
 * @param context (object) the IOPA Context object on which to add the alias properties
 * @returns (void)
 * @private
 */
function _helpers_refreshPrototypeIopaContext (context)
{
    var proto = Object.getPrototypeOf(context);
    
    Object.keys(context).forEach(function (_property)
                                    {
                                    
                                    var n = _property.indexOf(".");
                                    if (n>-1)
                                    {
                                    
                                    var short = _property.substring(0,n) + _property.substring(n+1);
                                    
                                    Object.defineProperty(proto, short, {
                                                          get: function () {
                                                          return this[_property];
                                                          },
                                                          
                                                          set: function (val) {
                                                          this[_property] = val;
                                                          }
                                                          
                                                          });
                                    }
                                    
                                    });
    
}

/**
 * Create alias access methods on context.response for context body elemeent for given stream/readable/writable prototype
 *
 * Note: the alias will be a collection of both functions (which simply shell out to target function) and valuetypes (which
 * have a getter and setter defined which each shell out to the target property)
 *
 * @method _helpers_cloneBodyPrototypeAlias
 *
 * @param targetObjectPrototype (__proto__)  the prototype object for the context.response object on which the alias properties are set
 * @param sourceObjectprototype (__proto__)  the prototpye object for the generic stream/writable on which to enumerate all properties
 * @param iopaContextKey (string) e.g., "iopa.Body" 
 * @returns (void)
 * @private
 */
function _helpers_cloneBodyPrototypeAlias(targetObjectPrototype, sourceObjectprototype, iopaContextKey)
{
    Object.getOwnPropertyNames(sourceObjectprototype).forEach(function (_property)
                                                              {
                                                              if (typeof( sourceObjectprototype[_property]) === 'function')
                                                              {
                                                              targetObjectPrototype[_property] = function(){
                                                              var body = this[iopaContextKey];
                                                              return body[_property].apply(body, Array.prototype.slice.call(arguments));
                                                              };
                                                              }
                                                              else
                                                              {
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


/**
 * Extract name from IOPA Property
 *
 * @method private_getSuffix
 * @param prefix (string)  the prefix to search for (e.g., "iopa.")
 * @param data (string)  the Owin Property (e.g., "iopa.Body")
 * @returns (string)  the suffix if found (e.g., "iopa.Body"), null if no match
 * @private
 */

function private_getSuffix(prefix, data) {
    if (data.lastIndexOf(prefix, 0) === 0)
        return data.substring(prefix.length);
    else
        return null;
}
