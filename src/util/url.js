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

constants = require('../iopa/constants')
IOPA = constants.IOPA,
  
exports.default = function urlparse(context, address) {

  var parse, instruction, index, key
    , extracted
    , i = 0;

  extracted = extractProtocol_(address);
  context[IOPA.Scheme]  = extracted.protocol  || '';
  address = extracted.rest;

  for (; i < instructions.length; i++) {
    instruction = instructions[i];
    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      context[key] = address;
    } else if ('string' === typeof parse) {
      if (~(index = address.indexOf(parse))) {
        if ('number' === typeof instruction[2]) {
          context[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          context[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if (index = parse.exec(address)) {
      context[key] = index[1];
      address = address.slice(0, address.length - index[0].length);
    }

   if (instruction[4]) {
      context[key] = context[key].toLowerCase();
    }
  }

 context.params = querystringparse_(context[IOPA.QueryString]);

}


// PRIVATE METHODS

const protocolRegExp = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i;

const instructions = [
  ['?', IOPA.QueryString],       
  ['/', IOPA.Path], 
  ['@', IOPA.Auth, 1], 
  [/:(\d+)$/, IOPA.Port],
  [NaN, IOPA.Host, undefined, 1, true]
];

function extractProtocol_(address) {
  var match = protocolRegExp.exec(address);

  return {
    protocol: match[1] ? match[1].toLowerCase() : '',
    slashes: !!match[2],
    rest: match[3] ? match[3] : ''
  };
}

function querystringparse_(query) {
  var parser = /([^=?&]+)=([^&]*)/g
    , result = {}
    , part;

  for (;
    part = parser.exec(query);
    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
  );

  return result;
}