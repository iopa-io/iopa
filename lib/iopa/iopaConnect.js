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
var path = require('path');
var url = require('url');

// PUBLIC EXPORTS

/**
 * Expands IOPA context object with various helper methods
 *
 * @method addReqRes
 *
 * @param context (object)  the javascript object on which to add the prototypes (i.e., the IOPA context)
 * @returns (void)
 * @public
 */
exports.addReqRes = function addReqRes(context) {
    context.req = new IopaHttpServerRequestBridge(context);
    context.res = new IopaHttpServerResponseBridge(context);
 };

/**
 * Representss an IOPA bridge to Node.js http ServerRequest Object
 *
 * @class IopaHttpServerRequestBridge
 * @constructor
 */
function IopaHttpServerRequestBridge(iopa){ this.context = iopa;  };

/**
 * Representss an IOPA bridge to Node.js http ServerResponse Object
 *
 * @class IopaHttpServerResponseBridge
 * @constructor
 */
function IopaHttpServerResponseBridge(iopa){ this.context = iopa;  };

/**
 * Self initiating method to create the prototype properties on the bridges to match http ServerRequest and ServerResponse objects
 *
 * @method init_InstallRequestResponsePrototypes
 * @private
 */
(function init_InstallRequestResponsePrototypes()
 {
 
 //REQUEST
 var req= IopaHttpServerRequestBridge;
 
 Object.defineProperty(req.prototype, "socket", { get: function () {  return this.context["server.RawStream"];  } });
 Object.defineProperty(req.prototype, "connection", { get: function () {  return {}  } });
 
 Object.defineProperty(req.prototype, "httpVersion", {
                       get: function () { return  this.context["iopa.Protocol"].split("/")[1];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, "httpVersionMajor", {
                       get: function () { return this.context["iopa.Protocol"].split("/")[1].split(".")[0];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, "httpVersionMinor", {
                       get: function () { return this.context["iopa.Protocol"].split("/")[1].split(".")[1];
                       },
                       set: function (val) { throw ("not implemented");    }
                       });
 
 Object.defineProperty(req.prototype, "originalUrl", {
                       get: function () {
                       if (!this._originalurl)
                       this._originalUrl = this.url;
                       return this._originalurl;
                       }
                       });
 
 Object.defineProperty(req.prototype, "url", {
                       get: function () {
                       var uri =
                       this.context["iopa.Path"];
                       
                       if (this.context["iopa.QueryString"] != "")
                       uri += "?" + this.context["iopa.QueryString"];
                       return uri;
                       
                       }, set: function (val) {
                       if (!this._originalurl)
                       this._originalUrl = this.url;
                       var urlParsed = url.parse(val);
                       this.context["iopa.PathBase"] = "";
                       this.context["iopa.Path"] = urlParsed.pathName;
                       this.context["iopa.QueryString"] = urlParsed.query;
                       }
                       });
 
 Object.defineProperty(req.prototype, "complete", {
                       get: function () {  return false;   }
                       });
 
 Object.defineProperty(req.prototype, "headers", {
                       get: function () {  return this.context["iopa.Headers"];   }
                       });
 
 Object.defineProperty(req.prototype, "rawHeaders", {
                       get: function () {
                       var ret = [];
                       for(var key in this.context["iopa.Headers"]){
                       ret.push(key);
                       ret.push(this.context["iopa.Headers"]);
                       };
                       return ret;
                       }
                       });
 
 Object.defineProperty(req.prototype, "trailers", {
                       get: function () {  return {};   }
                       });
 
 Object.defineProperty(req.prototype, "rawTrailers", {
                       get: function () {  return []; }
                       });
 
 
 Object.defineProperty(req.prototype, "readable", {
                       get: function () {  return true ; }
                       });
 
 
 Object.defineProperty(req.prototype, "method", {
                       get: function () {  return this.context["iopa.Method"];   },
                       set: function (val) {  this.context["iopa.Method"] = val;    }
                       });
 
 req.prototype.getHeader = function(key)
 {
 return this.context.request.getHeader(key);
 }

 
 
 //RESPONSE
  var res= IopaHttpServerResponseBridge;
 
 Object.defineProperty(res.prototype, "socket", { get: function () {  return this.context.response["server.RawStream"]; } });
 Object.defineProperty(res.prototype, "connection", { get: function () {  return {}  } });
 
 Object.defineProperty(res.prototype, "statusCode", {
                       get: function () { return this.context.response["iopa.StatusCode"];  },
                       set: function (val) { return this.context.response["iopa.StatusCode"] = val;  },
                       });
 
 Object.defineProperty(res.prototype, "headersSent", {
                       get: function () { return  false;  }
                       });
 
 Object.defineProperty(res.prototype, "sendDate", {
                       get: function () { return true; },
                       set: function (val) { /* ignore */  },
                       });
 
 
 res.prototype.status =  function (code) { this.context.response["iopa.StatusCode"] = code; return this;}
 
 
 res.prototype.writeContinue = function writeContinue(statusCode, headers)
 {
 throw {name : "NotImplementedError", message : "writeContinue HTTP 100 not implemented per IOPA spec;  instead server must implement"};
 }
 
 res.prototype.setTimeout = function setTimeout(msecs, callback)
 {
 throw {name : "NotImplementedError", message : "set Timeout not implemented as not needed in IOPA"};
 }
 
 res.prototype.addTrailers = function addTrailers(trailers)
 {
 throw {name : "NotImplementedError", message : "HTTP Trailers (trailing headers) not supported"};
 }
 
 res.prototype.setHeader = function(key, value)
 {
 this.context.response.setHeader(key, value);
 }
 
 res.prototype.getHeader = function(key)
 {
 return this.context.response.getHeader(key);
 }
 
 res.prototype.removeHeader = function(key)
 {
 this.context.response.removeHeader(key);
 }
 
 res.prototype.writeHead = function(statusCode, reasonPhrase, headers)
 {
 this.context.response.writeHead(statusCode, reasonPhrase, headers);
 }
 
 //ADD BODY PROTOYPE ALIASES FOR REQUEST AND RESPONSE

 var Stream = require('stream');
 var Writable = Stream.Writable;
 var Readable = Stream.Readable;
 var EventEmitter = require('events').EventEmitter;

 _helpers_cloneBodyPrototypeAlias(req.prototype,EventEmitter.prototype, "iopa.Body");
 _helpers_cloneBodyPrototypeAlias(req.prototype,Stream.prototype, "iopa.Body");
 _helpers_cloneBodyPrototypeAlias(req.prototype,Readable.prototype, "iopa.Body");
 
 _helpers_cloneBodyPrototypeAlias(res.prototype,EventEmitter.prototype, "iopa.Body");
 _helpers_cloneBodyPrototypeAlias(res.prototype,Stream.prototype, "iopa.Body");
 _helpers_cloneBodyPrototypeAlias(res.prototype,Writable.prototype, "iopa.Body");
 
 }).call(global);


// PRIVATE HELPERS

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
                                                              var body = this.context[iopaContextKey];
                                                              return body[_property].apply(body, Array.prototype.slice.call(arguments));
                                                              };
                                                              }
                                                              else
                                                              {
                                                              Object.defineProperty(targetObjectPrototype, _property, {
                                                                                    
                                                                                    get: function () {
                                                                                    return this.context[iopaContextKey][_property];
                                                                                    },
                                                                                    
                                                                                    set: function (val) {
                                                                                    this.context[iopaContextKey][_property] = val;
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
