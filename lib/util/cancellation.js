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

module.exports = tokenSource;
module.exports.empty = tokenSource().token;

/**
 * A Cancellation Token Source
 *
 * @class tokenSource
 *
 * @method cancel  :signals cancel for all tokens issued by this source
 * @param reason (string)
 * @returns (void)
 *
 * @method token  : returns a cancellation token
 * @returns (token)
 *
 * @constructor
 * @public
 */
function tokenSource() {
    var data = {
    reason: null,
    isCancelled: false,
    listeners: []
    };
    function cancel(reason) {
        data.isCancelled = true;
        reason = reason || 'Operation Cancelled';
        if (typeof reason == 'string') reason = new Error(reason);
        reason.code = 'OperationCancelled';
        data.reason = reason;
        setTimeout(function () {
                   for (var i = 0; i < data.listeners.length; i++) {
                   if (typeof data.listeners[i] === 'function') {
                   data.listeners[i](reason);
                   }
                   }
                   }, 0);
    }
    return {
    cancel: cancel,
    token: token(data)
    };
}

/**
 * Helper Method to return a Cancellation Token
 *
 * @method token
 
 * @returns (token)
 *
 * @property isCancelled (bool)  - flag indicating if token has been cancelled
 * @property throwIfCancelled (bool)  - method to throw error when cancelled
 * @property onCancelled (function(cb))  - register callback for cancellation event;  callback on next tick if already occured
 *
 * @public
 */
function token(data) {
    var exports = {};
    exports.isCancelled = isCancelled;
    function isCancelled() {
        return data.isCancelled;
    }
    exports.throwIfCancelled = throwIfCancelled;
    function throwIfCancelled() {
        if (isCancelled()) {
            throw data.reason;
        }
    }
    exports.onCancelled = onCancelled;
    function onCancelled(cb) {
        if (isCancelled()) {
            setTimeout(function () {
                       cb(data.reason);
                       }, 0);
        } else {
            data.listeners.push(cb);
        }
    }
    return exports;
}