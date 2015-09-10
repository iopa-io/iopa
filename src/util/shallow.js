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

 const constants = require('../iopa/constants'),
    IOPA = constants.IOPA;

exports.merge = function merge(target, defaults) {
   if (!target) 
        throw new Error("target must not be empty");
   
    if (!defaults) 
        defaults = {};
            
    for (var key in defaults) {
        if (defaults.hasOwnProperty(key)  && !(target.hasOwnProperty(key))) target[key] = defaults[key];
    }
};

exports.mergeContext = function mergeContext(target, defaults) {
   
   if (!target) 
        throw new Error("target must not be empty");
     
     if (!defaults) 
        return; // nothing to do   
        
    for (var key in defaults) {
        if (defaults.hasOwnProperty(key) && (key !== IOPA.Headers)) target[key] = defaults[key];
    }
    
    if (defaults.hasOwnProperty(IOPA.Headers))
    {
        var targetHeaders = target[IOPA.Headers] || {};
        var sourceHeaders = defaults[IOPA.Headers];
                
        for (var key in defaults[IOPA.Headers]) {
            if (sourceHeaders.hasOwnProperty(key)) targetHeaders[key] = sourceHeaders[key];
        }
        
        target[IOPA.Headers] = targetHeaders;
        
         for (var key in defaults) {
            if ((key !== IOPA.Headers) && defaults.hasOwnProperty(key)) target[key] = defaults[key];
        }
        
    } else {
        
        for (var key in defaults) {
            if (defaults.hasOwnProperty(key)) target[key] = defaults[key];
        }
        
    }
};

exports.copy = function copy(source, target) {
  if (!source) 
        source = {};
        
   if (!target) 
        target = {};
           
    for (var key in source) {
        if (source.hasOwnProperty(key)) target[key] = source[key];
    }
    
    return target;
};

exports.clone = function clone(source) {
    var clone = {};
           
    for (var key in source) {
        if (source.hasOwnProperty(key)) clone[key] = source[key];
    }
    
    return clone;
};

exports.cloneFilter = function clone(source, blacklist) {
    var clone = {};
           
    for (var key in source) {
       if (source.hasOwnProperty(key) && (blacklist.indexOf(key) == -1)) clone[key] = source[key];
    }
    
    return clone;
};