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
  * Create alias access methods on context.response for context body elemeent for given stream/readable/writable prototype
  *
  * Note: the alias will be a collection of both functions (which simply shell out to target function) and valuetypes (which
  * have a getter and setter defined which each shell out to the target property)
  *
  * @method cloneKeyBehaviors
  *
  * @param targetObjectPrototype (__proto__)  the prototype object for the context.response object on which the alias properties are set
  * @param sourceObjectprototype (__proto__)  the prototpye object for the generic stream/writable on which to enumerate all properties
  * @param iopaContextKey (string) e.g., "iopa.Body" 
  * @returns (void)
  * @private
  */
exports.cloneKeyBehaviors = function cloneKeyBehaviors(targetObjectPrototype, sourceObjectprototype, iopaContextKey, response) {
    Object.getOwnPropertyNames(sourceObjectprototype).forEach(function (_property) {

        if (typeof (sourceObjectprototype[_property]) === 'function') {
            targetObjectPrototype[_property] = function () {
                var item;
                if (response)
                    item = this[iopaContextKey];
                else
                    item = this.response[iopaContextKey];

                return item[_property].apply(item, Array.prototype.slice.call(arguments));
            };
        }
        else {
            Object.defineProperty(targetObjectPrototype, _property, {

                get: function () {
                    var item;
                    if (response)
                        item = this[iopaContextKey];
                    else
                        item = this.response[iopaContextKey];

                    return item[_property];
                },

                set: function (val) {
                    var item;
                    if (response)
                        item = this[iopaContextKey];
                    else
                        item = this.response[iopaContextKey];

                    item[_property] = val;
                }

            });
        }
    });

}