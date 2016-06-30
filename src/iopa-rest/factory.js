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

const 
    URL = require('url'),
    contextExtensionsRESTAddTo = require('./contextExtensions-REST').addTo,
    constants = require('./constants'),
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,
    VERSION = constants.VERSION
    mergeContext = require('../util/shallow').mergeContext,
    Factory = require('./factory').default,
    IopaContext = require('../iopa-context/context').default;

// Add Rest Extensions to Iopa Context Prototype
contextExtensionsRESTAddTo(IopaContext.prototype);

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
Factory.prototype.createContextREST = function factory_createContext() {
    var context = this._create();
    var response = this._create();
    context.response = response;
    context.response[SERVER.ParentContext] = context;

    context[IOPA.Headers] = {};
    context[IOPA.Method] = "";
    context[IOPA.Host] = "";
    context[IOPA.Path] = "";
    context[IOPA.PathBase] = "";
    context[IOPA.Protocol] = "";
    context[IOPA.QueryString] = "";
    context[IOPA.Scheme] = "";
    context[IOPA.Body] = null;

    response[IOPA.Headers] = {};
    response[IOPA.StatusCode] = null;
    response[IOPA.ReasonPhrase] = "";
    response[IOPA.Protocol] = "";
    response[IOPA.Body] = null;
    response[IOPA.Headers]["Content-Length"] = null;

    return context;
};

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
Factory.prototype.createRequest = function createRequest(urlStr, options) {

    if (typeof options === 'string' || options instanceof String)
        options = { "iopa.Method": options };

    options = options || {};

    var context = this._create();
    context[SERVER.IsLocalOrigin] = true;
    context[SERVER.IsRequest] = true;
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
    context[IOPA.Body] = null;

    const SCHEMES = IOPA.SCHEMES,
        PROTOCOLS = IOPA.PROTOCOLS,
        PORTS = IOPA.PORTS

    switch (urlParsed.protocol) {
        case SCHEMES.HTTP:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = false;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTP;
            break;
        case SCHEMES.HTTPS:
            context[IOPA.Protocol] = PROTOCOLS.HTTP;
            context[SERVER.TLS] = true;
            context[IOPA.Headers]["Host"] = context[IOPA.Host];
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.HTTPS;
            break;
        case SCHEMES.COAP:
            context[IOPA.Protocol] = PROTOCOLS.COAP;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.COAP;
            break;
         case SCHEMES.COAPS:
            context[IOPA.Protocol] = PROTOCOLS.COAP;
            context[SERVER.TLS] = true;
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.COAPS;
            break;
         case SCHEMES.MQTT:
            context[IOPA.Protocol] = PROTOCOLS.MQTT;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.MQTT;
            break;
        case SCHEMES.MQTTS:
            context[IOPA.Protocol] = PROTOCOLS.MQTT;
            context[SERVER.TLS] = true;
            context[SERVER.RemotePort] = parseInt(urlParsed.port) || PORTS.MQTTS;
            break;
        default:
            context[IOPA.Protocol] = null;
            context[SERVER.TLS] = false;
            context[SERVER.RemotePort] =parseInt(urlParsed.port) || 0;
            break;
       };

    mergeContext(context, options);

    return context;
};

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
Factory.prototype.createRequestResponse = function createRequestResponse(urlStr, options) {
    var context = this.createRequest(urlStr, options);

    var response = this._create();
    context.response = response;
    context.response[SERVER.ParentContext] = context;

    response[IOPA.Headers] = {};
    response[IOPA.StatusCode] = null;
    response[IOPA.ReasonPhrase] = "";
    response[IOPA.Protocol] = context[IOPA.Protocol];
    response[IOPA.Body] = null;
    response[SERVER.TLS] = context[SERVER.TLS];
    response[SERVER.RemoteAddress] = context[SERVER.RemoteAddress];
    response[SERVER.RemotePort] = context[SERVER.RemotePort];
    response[SERVER.IsLocalOrigin] = false;
    response[SERVER.IsRequest] = false;
    response[SERVER.Logger] = context[SERVER.Logger];

    return context;
}
