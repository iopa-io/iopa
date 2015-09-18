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
 
 const Middleware = require('./middleware').default,
    Images = require('../util/images').default,
    guidFactory = require('../util/guid').default,
    
    merge = require('../util/shallow').merge,
    clone = require('../util/shallow').cloneDoubleLayer,
   
    constants = require('../iopa/constants'),
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,
    APPBUILDER = constants.APPBUILDER
  
const packageVersion = require('../../package.json').version;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/***
* AppBuilder Class to Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @class 
* @public
*/
function AppBuilder() {
    this.properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, AppBuilder);

    var defaults = {};
    defaults[SERVER.AppId] = guidFactory();
    defaults[SERVER.Capabilities] = {}
    defaults[SERVER.Capabilities][IOPA.CAPABILITIES.App] = {}
    defaults[SERVER.Capabilities][IOPA.CAPABILITIES.App][SERVER.Version] = packageVersion;
    defaults[SERVER.Logger] = console;
    defaults[APPBUILDER.DefaultApp] = DefaultApp;
    defaults[APPBUILDER.DefaultMiddleware] = [RespondMiddleware];
    defaults[SERVER.AppId] = guidFactory();

    merge(this.properties, defaults);
    this.serverMiddleware = [];
    this.clientMiddleware = [];
}

 Object.defineProperty(AppBuilder.prototype, "log", {
                       get: function () { return  this.properties[SERVER.Logger] ;
                       }  });

AppBuilder.prototype.middlewareProxy = Middleware;

/**
* Add Middleware Function to AppBuilder pipeline
*
* @param mw the middleware to add 
*/
AppBuilder.prototype.use = function use(mw) {
    this.middlewareProxy(this, this.serverMiddleware, this.clientMiddleware, mw)
    return this;
}
        
/**
* Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @return {function(context): {Promise} IOPA application 
* @public
*/
AppBuilder.prototype.build = function build() {
    var pipeline = this.compose(this.serverMiddleware);
    
    if (this.clientMiddleware.length > 0)    
       pipeline.connect = this.compose(this.clientMiddleware);
    else
       pipeline.connect =  function (context) {return Promise.resolve(context);};
    
    pipeline.properties = this.properties;
   
    return pipeline;
}

/**
* Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @return {function(context): {Promise} IOPA application 
* @public
*/
AppBuilder.prototype.compose = function compose(middlewareArray) {
    var middleware = this.properties[APPBUILDER.DefaultMiddleware].concat(middlewareArray).concat(this.properties[APPBUILDER.DefaultApp]);
    var app = this;
    const capabilities = app.properties[SERVER.Capabilities];
      
    var pipeline = function app_pipeline(context) {
         merge(context[SERVER.Capabilities], clone(capabilities));
         if (context.response)
           merge(context.response[SERVER.Capabilities], clone(capabilities));
        
        var i, prev, curr;
        i = middleware.length;
        prev = function () {
            return Promise.resolve(null);
        };
        prev.dispatch =  function () {
            return Promise.resolve(null);
        };
        while (i--) {
            curr = middleware[i];
            var dispatch = (function(curr, prev, newContext){curr.call(this, newContext, prev)}).bind(app, curr, prev);
            prev = curr.bind(app, context, prev);
            prev.dispatch = dispatch;
        }
        return prev();
    };
    
    return pipeline;
}

 /**
  * DEFAULT EXPORT
  */
exports.default = AppBuilder;

// DEFAULT HANDLERS:  RESPOND, DEFAULT APP, ERROR HELPER

function RespondMiddleware(context, next) {

    var value = next();
    
    if (value == undefined)
    {
      context.log.error("Server Error: One of the middleware functions on this server returned no value");
    }
    else
      return value.then(
        function (ret) {
             return ret;
        },
        function (err) {
            DefaultError(context, err);
              return Promise.resolve(null);
        });
}

function DefaultApp(context, next) {
    if (context[IOPA.Error]) {
        return Promise.reject(context[IOPA.Error]);
    }
    else {
        return Promise.resolve(null);
    }
}

function DefaultError(context, err) {
    if (context[IOPA.Protocol] == IOPA.PROTOCOLS.HTTP) {
        DefaultErrorHttp(context, err);
    }
    else {
        context.log.error("Server Error: " + err);
        throw (err);
    }
}

function DefaultErrorHttp(context, err) {
    context.log.error(err);
    if (err === 404) {
        context.response.writeHead(404, { 'Content-Type': 'text/html' });
        context.response.write(Images.logo);
        context.response.end('<h1>404 Not Found</h1><p>Could not find resource:</p><xmb>' + this.request.path + '</xmb>');
    }
    else {
        context.response.writeHead(500, { 'Content-Type': 'text/html' });
        context.response.write(Images.logo);
        context.response.end('<h1>500 Server Error</h1><p>An error has occurred:</p><xmb>' + err + '</xmb> ');
    }
}