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


const Middleware = require('./middleware').default,
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
    _classCallCheck(this, AppBuilder);
    this.properties = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var defaults = {};
    defaults[SERVER.AppId] = guidFactory();
    defaults[SERVER.Capabilities] = {}
    defaults[SERVER.Capabilities][IOPA.CAPABILITIES.App] = {}
    defaults[SERVER.Capabilities][IOPA.CAPABILITIES.App][SERVER.Version] = packageVersion;
    defaults[SERVER.Logger] = console;
    defaults[APPBUILDER.DefaultApp] = DefaultApp;
    defaults[APPBUILDER.DefaultMiddleware] = [DefaultMiddleware];

    merge(this.properties, defaults);
    this.middleware = { invoke: [], listen: [] };
}

Object.defineProperty(AppBuilder.prototype, "log", {
    get: function () {
        return this.properties[SERVER.Logger];
    }
});

AppBuilder.prototype.middlewareProxy = Middleware;

/**
* Add Middleware Function to AppBuilder pipeline
*
* @param mw the middleware to add 
*/
AppBuilder.prototype.use = function use(mw) {

    var params = private_getParams(mw);
    if (params === 'app') {
        var mw_instance = Object.create(mw.prototype);
        mw.call(mw_instance, this);

        if (typeof mw_instance.invoke === 'function')
            this.middleware.invoke.push(mw_instance.invoke.bind(mw_instance));

        if (typeof mw_instance.listen === 'function')
            this.middleware.listen.push(mw_instance.listen.bind(mw_instance));

    }
    else
        this.middleware.invoke.push(this.middlewareProxy(this, mw));

    return this;
}


/**
* Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @return {function(context): {Promise} IOPA application 
* @public
*/
AppBuilder.prototype.build = function build() {

    var middleware = this.properties[APPBUILDER.DefaultMiddleware].concat(this.middleware.invoke).concat(this.properties[APPBUILDER.DefaultApp]);
    var pipeline = this.compose_(middleware);

    if (this.middleware.listen.length > 0)
        pipeline.listen = this.compose_(this.middleware.listen);
    else
        pipeline.listen = function (context) { return Promise.resolve(context); };

    pipeline.properties = this.properties;
    this.properties[SERVER.IsBuilt] = true;
    this.properties[SERVER.Pipeline] = pipeline;
    return pipeline;
}

/**
* Call Listen Pipeline to typically start Servers
*
* @return {function(context): {Promise} IOPA application 
* @public
*/
AppBuilder.prototype.listen = function listen(options) {
    return this.properties[SERVER.Pipeline].listen.call(this, options);
}

/**
* Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
*
* @return {function(context): {Promise} IOPA application 
* @public
*/
AppBuilder.prototype.compose_ = function compose_(middleware) {
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
        while (i--) {
            curr = middleware[i];
            var invokeremainder = (function (curr, next, newContext) { curr.call(this, newContext, next) }).bind(app, curr, next);
            next = curr.bind(app, context, next);
            next.invoke = invokeremainder;
        }
        return next();
    };
}

/**
 * DEFAULT EXPORT
 */
exports.default = AppBuilder;

// DEFAULT HANDLERS:  RESPOND, DEFAULT APP, ERROR HELPER

function DefaultMiddleware(context, next) {
    var value = next();

    if (typeof value == 'undefined') {
        context.log.error("Server Error: One of the middleware functions on this server returned no value");
    }
    else
        return value;
}

function DefaultApp(context, next) {
    if (context[IOPA.Error])
        return Promise.reject(context[IOPA.Error]);
    else
        return Promise.resolve(context);
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
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
    if (result === null)
        result = []
    result = result.join();
    return result
}