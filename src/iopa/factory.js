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
    VERSION = constants.VERSION
    cloneDoubleLayer = require('../util/shallow').cloneDoubleLayer,
    merge = require('../util/shallow').merge,
    IopaContext = require('./context').default,
    FreeList = require('../util/freelist').FreeList;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents IopaContext Factory of up to 100 items
 *
 * @instance IopaContextFactory

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

Factory.Context = IopaContext;

Object.defineProperty(Factory.prototype, SERVER.Logger, {
    get: function () { return this._logger; },
    set: function (value) { this._logger = value; }
});


/**
* Create a new barebones IOPA Request with or without a response record
*/
Factory.prototype._create = function factory_create() {
    var context = this._factory.alloc().init();
    context.dispose = this._dispose.bind(this, context);
    context[SERVER.Logger] = this._logger;
    context[SERVER.Factory] = this;
     return context;
};

/**
* Release the memory used by a given IOPA Context
*
* @param context the context to free 
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
* Create a new IOPA Context Core, with default [iopa.*] values populated
*/
Factory.prototype.createContext = function factory_createContext() {
    var context = this._create();
   
    context[IOPA.Method] = "IOPA";
    context[IOPA.Path] = "";
    context[IOPA.Body] = {};
  
    return context;
};

/**
* Create a new IOPA Context, with default [iopa.*] values populated
*/
Factory.prototype.mergeCapabilities = function factory_mergeCapabilities(childContext, parentContext) {
   
    childContext[SERVER.ParentContext] = parentContext;
    merge(childContext[SERVER.Capabilities], cloneDoubleLayer(parentContext[SERVER.Capabilities]));
   
    if (childContext.response)
       merge(childContext.response[SERVER.Capabilities], cloneDoubleLayer(parentContext.response[SERVER.Capabilities]));

};



// EXPORTS  
exports.default = Factory;