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

const FreeList = require('../util/freelist.js').FreeList,
    Events = require('events'),
    URL = require('url'),
    util = require('util'),

    Cancellation = require('../util/cancellation').default,
    PrototypeExtend = require('./contextPrototypeExtend').default,

    constants = require('./constants'),
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,
    
    mergeContext = require('../util/shallow').mergeContext;

  

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
function IopaContext() {
     return this;
}
    
/**
* Initialize blank IopaContext object
* Generic properties common to all server types included
*
* @method Init
*/
IopaContext.prototype.init = function init() {
    this[IOPA.Version] = "1.2";
    var _cancellationTokenSource = Cancellation();
    this[SERVER.CallCancelledSource] = _cancellationTokenSource;
    this[IOPA.CallCancelled] = _cancellationTokenSource.token;
    this[IOPA.Events] = new Events.EventEmitter();
    this[IOPA.Seq] = _nextSequence();
    this[SERVER.Logger] = console;
    this.log = this[SERVER.Logger];

    return this;
};

/**
 * Represents IopaContext Factory of up to 100 items
 *
 * @instance IopaContextFactory

 * @method alloc()  get new IopaContext from pool or by creation if none available; remember to call context.init();
 * @method free(context)   return IopaContext to the pool for reuse
 */
function IopaContextFactory() {
    _classCallCheck(this, IopaContextFactory);
    FreeList.call(this, 'IopaContext', 100, function () { return IopaContext.apply(Object.create(IopaContext.prototype)); });
 }

util.inherits(IopaContextFactory, FreeList);

/**
* Create a new barebones IOPA Request with or without a response record
*/
 IopaContextFactory.prototype._create = function _create(withoutResponse) {

    var context = this.alloc();

    context.init();

    if (!withoutResponse) {
        var response = this.alloc().init();
        context.response = response;
        context.response.parent = context;
    }

    return context;
};

/**
* Release the memory used by a given IOPA Context
*
* @param context the context to free 
*/   
IopaContextFactory.prototype.dispose = function dispose(context) {

    if (context.response) {
        //    console.log("Disposing " + context.response["iopa.Seq"]);
        
        var response = context.response;
        for (var prop in response) { if (response.hasOwnProperty(prop)) { response[prop] = null; } }
        this.free(response);
    }
            
    //   console.log("Disposing " + context["iopa.Seq"]);
            
    for (var prop in context) { if (context.hasOwnProperty(prop)) { context[prop] = null; } };

    this.free(context);
};

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
IopaContextFactory.prototype.createContext = function createContext() {
    var context = this._create();

    context[IOPA.Headers] = {};
    context[IOPA.Method] = "";
    context[IOPA.Host] = "";
    context[IOPA.Path] = "";
    context[IOPA.PathBase] = "";
    context[IOPA.Protocol] = "";
    context[IOPA.QueryString] = "";
    context[IOPA.Scheme] = "";
    context[IOPA.Body] = null;

    var response = context.response;
    response[IOPA.Headers] = {};
    response[IOPA.StatusCode] = null;
    response[IOPA.ReasonPhrase] = "";
    response[IOPA.Protocol] = "";
    response[IOPA.Body] = null;
    response[IOPA.Headers]["Content-Length"] = "-1";

    return context;
};

IopaContextFactory.prototype.DisposableRequest = function DisposableRequest(urlStr, method) {
    return _disposable(this.createContext());
}

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
IopaContextFactory.prototype.createRequest = function createRequest(urlStr, options) {
    
    if (typeof options === 'string' || options instanceof String)
       options = { "iopa.Method": options};
       
    options = options || {};
      
    var context = this._create(true);
    context[SERVER.IsLocalOrigin] = true;
    context[SERVER.OriginalUrl] = urlStr;
    context[IOPA.Method] = options[IOPA.Method] || IOPA.METHODS.GET;

    var urlParsed = URL.parse(urlStr);
    context[IOPA.PathBase] = "";
    context[IOPA.Path] = urlParsed.pathname || "";
    context[IOPA.QueryString] = urlParsed.query;
    context[IOPA.Scheme] = urlParsed.protocol;
    context[SERVER.RemoteAddress] = urlParsed.hostname;
    context[IOPA.Host] = urlParsed.hostname;
    context[IOPA.Headers] = {};
    
    const SCHEMES = IOPA.SCHEMES,
        PROTOCOLS = IOPA.PROTOCOLS,
        PORTS = IOPA.PORTS
  
    
    switch (urlParsed.protocol) {
        case SCHEMES.HTTP:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = false;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = urlParsed.port || PORTS.HTTP;
            break;
        case SCHEMES.HTTPS:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = false;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = urlParsed.port || PORTS.HTTPS;
            break;
        case SCHEMES.COAP:
            context[IOPA.Protocol] = PROTOCOLS.COAP;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = urlParsed.port || PORTS.COAP;
            break;
        case SCHEMES.COAPS:
            context[IOPA.Protocol] = PROTOCOLS.COAP;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = urlParsed.port || PORTS.COAPS;
            break;
        case SCHEMES.MQTT:
            context[IOPA.Protocol] = PROTOCOLS.MQTT;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = urlParsed.port || PORTS.MQTT;
            break;
        case SCHEMES.MQTTS:
            context[IOPA.Protocol] = PROTOCOLS.MQTT;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = urlParsed.port || PORTS.MQTTS;
            break;
        default:
            context[IOPA.Protocol] = urlParsed.protocol;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = urlParsed.port || 0;
    };
    
    mergeContext(context, options);

    return context;
};

IopaContextFactory.prototype.DisposableRequest = function DisposableRequest(urlStr, method) {
    return _disposable(this.createRequest(urlStr, method));
};

function _disposable(context) {
    var that = this;
    var ctx = context
    
    return Promise.resolve(ctx)
      .disposer(function(ctx, promise){
          that.dispose(ctx);
          ctx = null;
          that = null;          
      });
};

const maxSequence = Math.pow(2, 16);
var _lastSequence = Math.floor(Math.random() * (maxSequence - 1));

function _nextSequence() {
    if (++_lastSequence === maxSequence)
        _lastSequence = 1;

    return "#" + _lastSequence.toString();
};

var _factoryInstance = new IopaContextFactory();
exports.default = _factoryInstance;
  
/**
* DEFAULT EXPORT AND SELF INITIALIZATION
*/
var _factoryInstance = new IopaContextFactory();
exports.default = _factoryInstance;

function runonce(){
     var _context = _factoryInstance.createContext();   //  for adding prototype properties only
    PrototypeExtend(_context);
    _factoryInstance.free(_context);
    _context = null;
};
runonce();
