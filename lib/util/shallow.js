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

module.exports.merge = function (source, defaults) {
    var target = {};
   
    if (!defaults) 
        defaults = {};
        
     if (!source) 
        source = {};
        
    for (var key in defaults) {
        if (defaults.hasOwnProperty(key)) target[key] = defaults[key];
    }
    
    for (var key in source) {
        if (source.hasOwnProperty(key)) target[key] = source[key];
    }
    
    return target;
};


module.exports.copy = function (source, target) {
  if (!source) 
        source = {};
        
   if (!target) 
        target = {};
           
    for (var key in source) {
        if (source.hasOwnProperty(key)) target[key] = source[key];
    }
    
    return target;
};

module.exports.clone = function (source) {
    var clone = {};
           
    for (var key in source) {
        if (source.hasOwnProperty(key)) clone[key] = source[key];
    }
    
    return clone;
};