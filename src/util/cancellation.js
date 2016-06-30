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

/**
 * A Cancellation Token Source
 *
 * @class tokenSource
 *
 * @method cancel  :signals cancel for all tokens issued by this source
 * @param reason (string)
 *
 * @method token  : returns a cancellation token
 * @returns (token)
 *
 * @constructor
 * @public
 */

const constants = require('../iopa/constants'),
    IOPA = constants.IOPA

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function TokenSource() {
    _classCallCheck(this, TokenSource);
    
    this.data = {
        reason: null,
        isCancelled: false,
        listeners: []
    };
}

TokenSource.prototype.cancel = function TokenSource_cancel(reason) {
    this.data.isCancelled = true;
    this.data.reason = reason;
    for (var i = 0; i < this.data.listeners.length; i++) {
        if (typeof this.data.listeners[i] === 'function') {
            this.data.listeners[i](reason);
        }
    }
}

Object.defineProperty(TokenSource.prototype, "token", {
                       get: function () { return new Token(this) } 
                       });
                       
Object.defineProperty(TokenSource.prototype, "isCancelled", {
                       get: function () { return this.data.isCancelled; } 
                       });
                       
Object.defineProperty(TokenSource.prototype, "reason", {
                       get: function () { return this.data.reason; } 
                       });
 
TokenSource.prototype.register = function TokenSource_register(cb){
      this.data.listeners.push(cb);
};

/**
 * Helper Method to return a Cancellation Token
 *
 * @method token
 
 * @returns (token)
 *
 * @property isCancelled: bool  - flag indicating if token has been cancelled
 * @function throwIfCancelled():   - throw error when cancelled
 * @function onCancelled(cb): Promise  - get a promise
 *
 * @public
 */
function Token(source) {
    this.source = source;
}

Object.defineProperty(Token.prototype, "isCancelled", {
                       get: function () { return  this.source.isCancelled } 
                       });
                       
Token.prototype.onCancelled = function (callback){ 
    this.source.register(callback); 
};

Token.prototype.throwIfCancelled = function(){
      if (this.isCancelled) {
            throw new Error(this.source.reason);
        }
        
      this.onCancelled(function(reason)
         {throw new Error(reason);}
          
      );
};

exports.empty = (new TokenSource()).token;
exports.default = TokenSource;