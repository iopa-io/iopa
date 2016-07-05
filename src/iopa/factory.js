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

const CancellationTokenSource = require('../util/cancellation').default,
    constants = require('./constants'),
    IOPA = constants.IOPA,
    SERVER = constants.SERVER,
    VERSION = constants.VERSION,
    cloneDoubleLayer = require('../util/shallow').cloneDoubleLayer,
    merge = require('../util/shallow').merge,
    IopaContext = require('./context').default,
    FreeList = require('../util/freelist').FreeList,
    mergeContext = require('../util/shallow').mergeContext;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents IopaContext Factory of up to 100 items
 *
 * @instance Factory

 * @method alloc()  get new IopaContext from pool or by creation if none available; remember to call context.init();
 * @method free(context)   return IopaContext to the pool for reuse
 */
function Factory(options) {
    _classCallCheck(this, Factory);

    options = options || {};
    var size = options["factory.Size"] || 100;

    this._logger = options[SERVER.Logger] || console;

    this._factory = new FreeList('IopaContext', size, function () { return IopaContext.apply(Object.create(IopaContext.prototype)); });
}

//STATIC PROPERTIES

Factory.Context = IopaContext;

//PUBLIC PROPERTIES 

Object.defineProperty(Factory.prototype, SERVER.Logger, {
    get: function () { return this._logger; },
    set: function (value) { this._logger = value; }
});

//PUBLIC METHODS 

/**
 * Creates a new IOPA Context 
 *
 * @method createContext
 *
 * @param url string representation of scheme://host/hello?querypath
 * @param options object 
 * @returns context
 * @public
 */
Factory.prototype.createContext = function factory_createContext(url, options) {
    options = this.validOptions(options);

    var context = this._factory.alloc().init();
    context.dispose = this._dispose.bind(this, context);
    context[SERVER.Logger] = this._logger;

    if (!options["reqres"]) {
        context[IOPA.Method] = options[IOPA.Method] || IOPA.METHODS.GET;
        context[IOPA.Path] = "";
        context[IOPA.Body] = null;

        context[SERVER.IsLocalOrigin] = true;
        context[SERVER.IsRequest] = true;
        if (url)
            context.parseUrl(url);
    }

    context.create = this.createChildContext.bind(this, context);

    mergeContext(context, options);

    return context;
};

/**
 * Creates a new IOPA Context that is a child request/response of a parent Context
 *
 * @method createChildContext
 *
 * @param parentContext IOPA Context for parent
 * @param url string representation of /hello to add to parent url
 * @param options object 
 * @returns context
 * @public
 */
Factory.prototype.createChildContext = function factory_createChildContext(parentContext, url, options) {
    options = this.validOptions(options);

    var context = this.createContext();
    this.mergeCapabilities(context, parentContext);

    context[IOPA.Path] = parentContext[IOPA.Path] + (url || "");
    context[IOPA.Scheme] = parentContext[IOPA.Scheme];
    context[IOPA.Host] = parentContext[IOPA.Host];
    context[IOPA.Port] = parentContext[IOPA.Port];

    mergeContext(context, options);

    return context;
};

//PROTECTED AND PRIVATE METHODS

/**
 * Merges SERVER.Capabilities of parent Context onto child Context
 *
 * @method mergeCapabilities
 *
 * @param parentContext IOPA Context for parent
 * @param childContext IOPA Context for child that is modified by this method
 * @protected
 */
Factory.prototype.mergeCapabilities = function factory_mergeCapabilities(childContext, parentContext) {

    childContext[SERVER.ParentContext] = parentContext;
    merge(childContext[SERVER.Capabilities], cloneDoubleLayer(parentContext[SERVER.Capabilities]));

    if (childContext.response && parentContext.response)
        merge(childContext.response[SERVER.Capabilities], cloneDoubleLayer(parentContext.response[SERVER.Capabilities]));
};

/**
 * Release the memory used by a given IOPA Context
 *
 * @method _dispose
 *
 * @param context object  the context to free 
 * @private
 */
Factory.prototype._dispose = function factory_dispose(context) {
    if (context == null || context[SERVER.CancelTokenSource] == null)
        return;

    if (context.response) {
        var response = context.response;
        for (var prop in response) { if (response.hasOwnProperty(prop)) { response[prop] = null; } }
        this._factory.free(response);
    }

    for (var prop in context) { if (context.hasOwnProperty(prop)) { context[prop] = null; } };

    this._factory.free(context);
};

/**
 * Clean Options;  allows overide for future validation
 *
 * @method validOptions
 *
 * @param options string or object dictionary
 * @protected
 */
Factory.prototype.validOptions = function factory_validOptions(options) {
    if (typeof options === 'string' || options instanceof String)
        return { [IOPA.Method]: options };
    else
        return options || {};
};

/**
 * Creates a new IOPA Context for Connect
 *
 * @method createContext
 *
 * @param url string representation of scheme://host/hello?querypath
 * @param options object 
 * @returns context
 * @public
 */
Factory.prototype._createRaw = function factory_createRaw() {
    var context = this._factory.alloc().init();
    context.dispose = this._dispose.bind(this, context);
    context[SERVER.Logger] = this._logger;
    return context;
};

exports.default = Factory;