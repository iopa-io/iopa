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
    this.middleware = {channel:[], invoke: [], connect: [], dispatch: []};
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
    
    var params = private_getParams(mw);
    if (params === 'app')
       {  var mw_instance = Object.create(mw.prototype); 
          mw.call(mw_instance, this);
          
          if (typeof mw_instance.invoke === 'function')
             this.middleware.invoke.push(mw_instance.invoke.bind(mw_instance));
           
          if (typeof mw_instance.channel === 'function')
             this.middleware.channel.push(mw_instance.channel.bind(mw_instance));
             
          if (typeof mw_instance.connect === 'function')
             this.middleware.connect.push(mw_instance.connect.bind(mw_instance));
             
          if (typeof mw_instance.dispatch === 'function')
             this.middleware.dispatch.push(mw_instance.dispatch.bind(mw_instance));
       }
       else
           this.middleware.invoke.push(this.middlewareProxy(this, mw));
           
    return this;
}

/**
* Add Middleware Function to AppBuilder pipeline
*
* @param mw the middleware to add 
*/
AppBuilder.prototype.invokeuse = function use(mw) {
    this.middleware.invoke.push(this.middlewareProxy(this, mw, "invoke"));
    return this;
}

/**
* Add Middleware Function to AppBuilder pipeline
*
* @param mw the middleware to add 
*/
AppBuilder.prototype.channeluse = function channeluse(mw) {
    this.middleware.channel.push(this.middlewareProxy(this, mw, "channel"));
    return this;
}

/**
* Add Middleware Function to AppBuilder pipeline
*
* @param mw the middleware to add 
*/
AppBuilder.prototype.connectuse = function connectuse(mw) {
    this.middleware.connect.push(this.middlewareProxy(this, mw, "connect"));
    return this;
}
   
/**
* Add Middleware Function to AppBuilder pipeline
*
* @param mw the middleware to add 
*/
AppBuilder.prototype.dispatchuse = function dispatchuse(mw) {
    this.middleware.dispatch.push(this.middlewareProxy(this, mw, "dispatch"));
    return this;
}     
        
/**
* Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @return {function(context): {Promise} IOPA application 
* @public
*/
AppBuilder.prototype.build = function build() {
    var pipeline, middleware;
    
     if (this.middleware.channel.length > 0){
        middleware = this.properties[APPBUILDER.DefaultMiddleware].concat(this.middleware.invoke).concat(this.properties[APPBUILDER.DefaultApp]);
        var requestPipeline = this.compose(middleware);

        middleware = this.properties[APPBUILDER.DefaultMiddleware].concat(this.middleware.channel).concat(this.properties[APPBUILDER.DefaultApp]);
        pipeline = this.compose(middleware, requestPipeline);   
      } else
     {
          middleware = this.properties[APPBUILDER.DefaultMiddleware].concat(this.middleware.invoke).concat(this.properties[APPBUILDER.DefaultApp]);
          pipeline = this.compose(middleware, requestPipeline);   
      }
     
    if (this.middleware.connect.length > 0)    
       pipeline.connect = this.compose(this.middleware.connect);
    else
       pipeline.connect =  function (context) {return Promise.resolve(context);};
       
     if (this.middleware.dispatch.length > 0)    
       pipeline.dispatch = this.compose(this.middleware.dispatch.reverse());
     else
       pipeline.dispatch =  function (context) {return Promise.resolve(context);};
    
    pipeline.properties = this.properties;
    this.properties[SERVER.IsBuilt] = true;
    this.properties[SERVER.Pipeline] = pipeline;
    return pipeline;
}

/**
* Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @return {function(context): {Promise} IOPA application 
* @public
*/
AppBuilder.prototype.compose = function compose(middleware, requestPipeline) {
    var app = this;  
    return function app_pipeline(context) {
        const capabilities = app.properties[SERVER.Capabilities];
         merge(context[SERVER.Capabilities], clone(capabilities));
         if (context.response)
           merge(context.response[SERVER.Capabilities], clone(capabilities));
        
        var i, next, curr;
        i = middleware.length;
        next = function () {
            return Promise.resolve(context);
        };
        next.dispatch =  function (ctx) {
            return Promise.resolve(ctx);
        };
        while (i--) {
            curr = middleware[i];
            var dispatch = (function(curr, next, newContext){curr.call(this, newContext, next)}).bind(app, curr, next);
            next = curr.bind(app, context, next);
            next.dispatch = dispatch;
            if (requestPipeline)
               next.invoke = requestPipeline;
        }
        return next();
    };
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
        return Promise.resolve(context);
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

/**
 * Gets the parameter names of a javascript function
 *
 * @method private_getParamNames
 * @param func (function)  the function to parse
 * @returns string  the names of each argument (e.g., function (a,b) returns ['a', 'b']
 * @private
 */
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
function private_getParams(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '')
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
    if(result === null)
        result = []
    result = result.join();
    return result
        }