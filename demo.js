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

/*
 * DEPENDENCIES
 *     note: npm include 'bluebird' if no Promise object exists
 */

const iopa = require('./index'),
  IopaApp = iopa.App,
  iopaFactory = new iopa.Factory({"factory.Size": 100}),
  iopaUtil = iopa.util,

  constants = iopa.constants,
  IOPA = constants.IOPA,
  SERVER = constants.SERVER
 
var test = new IopaApp();
var seq = 0;
test.use(function (context, next) {
   if (seq++ == 0)
   {
    context[SERVER.Capabilities]["urn:io.iopa:demo"] = "will only survive one record";
    context[SERVER.Capabilities]["urn:io.iopa:app"]["notused"] = "delete me";
   }
  context.log.info(context.toString());
  return next();
});

test.use(function (next) {
  this.log.info("HELLO WORLD");
  return Promise.resolve("DONE"); // stop processing in chain
});

var demo = test.build();
demo.listen();

var context = iopaFactory.createContext();
context[IOPA.Method] = "GET";
context[IOPA.Path] = "/test";
context[IOPA.Body] = {hello: "world"};

context.using(demo);

context = iopaFactory.createContext();

demo(context);

context.dispose();
console.log("DISPOSED " + context.toString());