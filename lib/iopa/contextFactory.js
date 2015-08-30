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

const FreeList = require('freelist').FreeList;
const Events = require('events');
const Cancellation = require('../util/cancellation.js');
const URL = require('url');
const Promise = require('bluebird');
const util = require('util');

/* *********************************************************
 * IOPA CONTEXT
 * ********************************************************* */

/**
 * Represents IOPA Context object for any REST Request/Response
 * See http://iopa.io for further details
 *
 * @class IopaContext
 * @constructor
 */
function IopaContext(){
     if (!(this instanceof IopaContext)) {
    return new IopaContext()
  }

  return this;
}

var counter =

/**
 * Initialize blank IopaContext object
 * Generic properties common to all server types included
 *
 * @method Init
 */
 IopaContext.prototype.init = function IopaContext_init(){
  this["iopa.Version"] = "1.2";
  var _cancellationTokenSource = Cancellation();
  this["iopa.CallCancelledSource"] = _cancellationTokenSource;
  this["iopa.CallCancelled"] = _cancellationTokenSource.token;
  this["iopa.Events"] = new Events.EventEmitter();
  this["iopa.Seq"] = _nextSequence();
  return this;
};

/**
 * Represents IopaContext Factory of up to 100 items
 *
 * @instance IopaContextFactory

 * @method alloc()  get new IopaContext from pool or by creation if none available; remember to call context.init();
 * @method free(context)   return IopaContext to the pool for reuse
 */
// Arguments are (freelistName, maxSize, constructorForNewObjects)
var IopaContextFactory = new FreeList('IopaContext', 100, function() {
  return IopaContext.apply(Object.create(IopaContext.prototype));
});

module.exports = IopaContextFactory;

IopaContextFactory.create = function() {
    var context = IopaContextFactory.alloc().init();
    var response = IopaContextFactory.alloc().init();
    context.response = response;
    context.response.parent = context;
    return context;
};
    
IopaContextFactory.dispose = function(context) {
    context.log.info("[IOPA] Disposing iopa messages " + context["iopa.Seq"] + "-" + context.response["iopa.Seq"]);
    
    var response = context.response;
    for (var prop in response) { if (response.hasOwnProperty(prop)) { delete response[prop]; } }
    IopaContextFactory.free(response);
    
    for (var prop in context) { if (context.hasOwnProperty(prop)) { delete context[prop]; } };
    IopaContextFactory.free(context);
};

/**
 * Creates a default IOPA Request
 *
 * @method createContext

 * @parm {string} urlStr url representation of Request http://locahost:8000/hello?world=yes
 * @parm {string} [method]  request method (e.g. 'GET')
 * @returns {IopaContext}
 */
 IopaContextFactory.createContext = function IopaContextFactory_createContext() {
    var context = IopaContextFactory.create();
    
    context["iopa.Headers"] = {};
    context["iopa.Method"] = "";
    context["iopa.Path"] = "";
    context["iopa.PathBase"] = "";
    context["iopa.Protocol"] = "";
    context["iopa.QueryString"] ="";
    context["iopa.Scheme"] = "";
    context["iopa.Body"] = null;
    
    var response = context.response ;
    response["iopa.Headers"] = {};
    response["iopa.StatusCode"] = null;
    response["iopa.ReasonPhrase"] = "";
    response["iopa.Protocol"] = "";
    response["iopa.Body"] = null;
    response["iopa.Headers"]["Content-Length"]= "-1";

    return context;
 }

/**
 * Creates a new IOPA Request using an HTTP or CoAP Url including host and port name
 *
 * @method createRequest

 * @parm {string} urlStr url representation of Request http://locahost:8000/hello?world=yes
 * @parm {string} [method]  request method (e.g. 'GET')
 * @returns {IopaContext}
 */
IopaContextFactory.createRequest = function IopaContextFactory_createRequest(urlStr, method){

  var context = IopaContextFactory.create();

   context["server.IsLocalOrigin"] = true;
   context["server.Url"] = urlStr;

   if (method)
    context["iopa.Method"] = method
   else
     context["iopa.Method"] = "GET";

   var urlParsed = URL.parse(urlStr);

   context["iopa.PathBase"] = "";
   context["iopa.Path"] = urlParsed.pathname;
   context["iopa.QueryString"] = urlParsed.query;
   context["iopa.Scheme"] = urlParsed.protocol;
   context["server.RemoteAddress"]  = urlParsed.hostname;
   context["iopa.Headers"] = {};

  if (!context["iopa.Method"])
       context["iopa.Method"] = "GET";

   switch(urlParsed.protocol) {
    case "http:":
        context["iopa.Protocol"] = "HTTP/1.1";
        context["server.TLS"] = false;
        context["iopa.Headers"]["Host"] = urlParsed.hostname;
        context["server.RemotePort"] = urlParsed.port || 80;
        break;
    case "https:":
        context["iopa.Protocol"] = "HTTP/1.1";
        context["server.TLS"] = true;
        context["server.RemotePort"] = urlParsed.port || 443;
        break;
    case "coap:":
        context["iopa.Protocol"] = "COAP/1.0";
        context["server.TLS"] = false;
        context["server.RemotePort"] = urlParsed.port || 5683;
        break;
    case "coaps:":
        context["iopa.Protocol"] = "COAP/1.0";
        context["server.TLS"] = true;
        context["server.RemotePort"] = urlParsed.port || 5684;
        break;
    case "mqtt:":
        context["iopa.Protocol"] = "MQTT/3.1.1";
        context["server.TLS"] = false;
        context["server.RemotePort"] = urlParsed.port || 1883;
        break;
    case "mqtts:":
        context["iopa.RequestProtocol"] = "MQTTS/3.1.1";
        context["server.TLS"] = true;
        context["server.RemotePort"] = urlParsed.port || 8883;
        break;
    default:
        return Promise.reject("invalid protocol");
   };

  var response = context.response ; 
    response["iopa.Body"] = null;
    response["iopa.Headers"] = {};
    response["iopa.StatusCode"] = null;
    response["iopa.ReasonPhrase"] = "";
    response["iopa.Protocol"] = context["iopa.Protocol"];
    response["iopa.Headers"]["Content-Length"]= "-1";
    return context;
};


const maxSequence   = Math.pow(2, 16);
var _lastSequence = Math.floor(Math.random() * (maxSequence - 1));

function _nextSequence() {
  if (++_lastSequence === maxSequence)
    _lastSequence = 1;

  return "#" + _lastSequence.toString();
};