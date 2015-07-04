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
 * DEPENDENCIES
 *     note: npm include coap before executing demo.js (coap not in package.json)
 */

var iopa = require('./index.js')
    , http = require('http')
    , util =require('util')

/*
 * HTTP DEMO
 */

var appHttp = new iopa.App();

appHttp.use(function(context, next){
    context.response.writeHead(200, {'Content-Type': 'text/html'});
    context.response.end("<html><head></head><body>Hello World from HTTP Server</body>");
    return next();
      });

http.createServer(appHttp.buildHttp()).listen(8000);

console.log("HTTP Server running at http://localhost:8000/");


/*
 * COAP DEMO


var appCoap = new iopa.App();
appCoap.use(function(next){

  this.response.end('Hello World from COAP resource ' + this["iopa.RequestPath"].split('/')[1] + '\n');
   return next();
    });

var server = coap.createServer();
server.on('request', appCoap.buildCoap());

server.listen(function() {
  var req = coap.request('coap://localhost/projector')

  req.on('response', function(res) {
    res.pipe(process.stdout)
    res.on('end', function() {
   //   process.exit(0)
    })
  })

  req.end()
})

console.log("COAP Server running at coap://localhost:5863/"); 
 */