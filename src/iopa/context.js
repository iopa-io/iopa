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
    util = require('../util/util'),
    EventEmitter = require('../util/events').EventEmitter,
    cloneFilter = require('../util/shallow').cloneFilter,
    URLParse = require('../util/url').default;

/* *********************************************************
 * IOPA CONTEXT
 * ********************************************************* */

/**
 * Represents IOPA Context object for any State Flow or REST Request/Response
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
* @method init
*/
IopaContext.prototype.init = function init() {
    this[IOPA.Version] = VERSION;
    this[IOPA.Seq] = "#" + _nextSequence();
    this[IOPA.Events] = new EventEmitter();
    this[SERVER.CancelTokenSource] = new CancellationTokenSource();
    this[SERVER.Capabilities] = {};
    this[SERVER.CancelToken] = this[SERVER.CancelTokenSource].token;
    return this;
};

IopaContext.prototype.toString = function () {

    return util.inspect(cloneFilter(this,
        [SERVER.CancelTokenSource,
            SERVER.CancelToken,
            SERVER.Logger,
            "log",
            "response",
            SERVER.Events,
            SERVER.CancelTokenSource,
            SERVER.CancelToken,
            "dispose",
            SERVER.Factory,
        ]));
}

IopaContext.prototype.parseUrl = function (url) {
   URLParse(this, url);
}

Object.defineProperty(IopaContext.prototype, "log", {
    get: function () {
        return this[SERVER.Logger];
    }
});

IopaContext.prototype.using = function (appFuncPromiseOrValue) {
    if (typeof (appFuncPromiseOrValue) === 'function')
        return _using(this, appFuncPromiseOrValue(this));
    else
        return _using(this, appFuncPromiseOrValue);
}

/*
* ES6 finally/dispose pattern for IOPA Context
* @param context Iopa
* @param p Promise or value
* returns Promise that always ultimately resolves to callback's result or rejects
*/
function _using(context, p) {

    return new Promise(function (resolve, reject) {
        if (typeof p === 'undefined')
            p = null;
        resolve(p);
    }).then(function (value) {
        return Promise.resolve(function () {
            process.nextTick(function () { if (context.dispose) context.dispose() });
            return value;
        } ());
    },
        function (err) {
            context.log.error(err);
            process.nextTick(function () { if (context.dispose) context.dispose() });
            throw err;
        });
};

const maxSequence = Math.pow(2, 16);
var _lastSequence = Math.floor(Math.random() * (maxSequence - 1));

function _nextSequence() {
    if (++_lastSequence === maxSequence)
        _lastSequence = 1;

    return _lastSequence.toString();
};

exports.default = IopaContext;