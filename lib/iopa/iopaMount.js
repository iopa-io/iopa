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

/*
 * Module dependencies.
 */
var Promise = require('bluebird');
var iopa = require('../util/constants.js').iopa;

module.exports = mount;
var mountMappings = [];

/**
 * Middleware Function to mount owin Middleware or application at given server host or path location
 *
 * @param {String} location
 * @param {appFunc} owin application to run at this mounting
 * @return {middleware function that can be inserted into main pipeline, or used as an appFunc}
 * @api public
 */
function mount(location, appFunc) {
    var host, path, match, pattern;

    // If the path is a fully qualified URL use the host as well.
    match = location.match(/^https?:\/\/(.*?)(\/.*)/);
    if (match) {
        host = match[1];
        path = match[2];
    } else {
        path = location;
    }

    if (path.charAt(0) !== '/')
    {
        throw new Error('Path must start with "/", was "' + path + '"');
    }

    path = path.replace(/\/$/, '');

    pattern = new RegExp('^' + escapeRegExp(path).replace(/\/+/g, '/+') + '(.*)');

    mountMappings.push({
        host: host,
        path: path,
        pattern: pattern,
        appFunc: appFunc
    });

    mountMappings.sort(byMostSpecific);

    return function iopaMountMiddleware(context, next){
        var pathBase, pathInfo, host, mapping, match, remainingPath, i, len;
      
        // response is already handled
        if (context.response[iopa.StatusCode] !== null)
           {return;}

        pathBase = context[iopa.PathBase];
        pathInfo = context[iopa.Path];
        host = context[iopa.Host];
      
        len = mountMappings.length;
        for (i = 0;  i < len; ++i) {
            mapping = mountMappings[i];
  
            // Try to match the host.
            if (mapping.host && mapping.host !== host)
              { continue;}
       
            // Try to match the path.
            if (!(match = pathInfo.match(mapping.pattern)))
             { continue;}
       
            // Skip if the remaining path doesn't start with a "/".
            remainingPath = match[1];
            if (remainingPath.length > 0 && remainingPath[0] !== '/')
              { continue;}
       
            context[iopa.PathBase] = pathBase + mapping.path;
            context[iopa.Path] = remainingPath;

            return mapping.appFunc.call(context, next);
        }
        
        return next();
    };
}

function byMostSpecific(a, b) {
    return (b.path.length - a.path.length) || ((b.host || '').length - (a.host || '').length);
}

function escapeRegExp(string) {
    return String(string).replace(/([.?*+^$[\]\\(){}-])/g, '\\$1');
}
