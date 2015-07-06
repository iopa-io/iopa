/* global "iopa.RemoveHeader" */
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
var path = require('path');
var url = require('url');
var util = require('util');
var CancellationTokenSource = require('../util/cancellation.js');
var constants = require('../util/constants.js');
var FreeList = require('freelist').FreeList;
var Events = require('events');
var iopaContextFactory = require('./iopaContextFactory.js');

var initialized = false;

exports = module.exports = function iopaHTTP(appFunc) {
    if (!initialized)
    {
        var context = iopaContextFactory.create();
        ProtoInit(context);
        iopaContextFactory.dispose(context);
        initialized = true;
    }
    
    return function(req, res) {
        var context = iopaContextFactory.create();
        context.reqres = req;
        context.response.reqres = res;
        res.setHeader('X-Powered-By', 'iopa');
        
  //    if (!context[constants.iopa.getHeader]("Content-Length"))
  //     context[constants.iopa.setHeader]("Content-Length", "-1");
        appFunc(context).then(
                           function(result) { iopaContextFactory.dispose(context);   context = null; },
                           function(err) { iopaContextFactory.dispose(context); context=null;}
                           );
    }
};

function ProtoInit(context){
    
    var iopa = Object.getPrototypeOf(context);
    
    Object.defineProperty(iopa, "iopa.Headers", {
                          get: function () {return this.reqres.headers }
                          });
    
    Object.defineProperty(iopa, "iopa.Method", {
                          get: function () { return this.reqres.method; },
                          set: function (val) { this.reqres.method = val;    }
                          });
    
    Object.defineProperty(iopa, "iopa.Path", {
                          get: function () { return url.parse(this.reqres.url).pathname; },
                          set: function (val) {
                          var uri = val;
                          var uriQuery =  url.parse(this.reqres.url).query;
                          if (uriQuery != "")
                          uri += "?" + uriQuery;
                          this.reqres.url = uri;
                          }
                          });
    
    Object.defineProperty(iopa, "iopa.PathBase", {
                          get: function () { return "" },
                          set: function (val) {
                          if (!this.reqres.originalUrl)
                          this.reqres.originalUrl = this.reqres.url;
                          var uri = path.join(val, this.reqres.url);
                          this.reqres.url = uri;
                          }
                          });
    
    Object.defineProperty(iopa, "iopa.Protocol", {
                          get: function () {return (this.reqres.httpVersion) ? "HTTP/" + this.reqres.httpVersion : this.parent.httpVersion; }
                          });
    
    Object.defineProperty(iopa, "iopa.QueryString", {
                          get: function () {  return  url.parse(this.req.url).query; },
                          set: function (val) {
                          var uri = url.parse(this.req.url).pathname;
                          var uriQuery =  val;
                          if (uriQuery != "")
                          uri += "?" + uriQuery;
                          this.req.url = uri;
                          }
                          });
    
    Object.defineProperty(iopa, "iopa.Scheme", {
                          get: function () { return "http"; }
                          });
    
    Object.defineProperty(iopa, "iopa.Body", {
                          get: function () {
                             return this.reqres;}
                          });
                             
    Object.defineProperty(iopa, "iopa.StatusCode", {
                          get: function () { return this.reqres.statusCode; },
                          set: function (val) { this.reqres.statusCode = val;    }
                          });
    
    Object.defineProperty(iopa, "iopa.ReasonPhrase", {
                          get: function () { return "";   },
                          set: function (val) { /* ignore */    }
                          });
              
    iopa["iopa.SetHeader"] = function(){this.reqres.setHeader.apply(this.reqres, Array.prototype.slice.call(arguments));};
    iopa["iopa.GetHeader"] = function(){this.reqres.getHeader.apply(this.reqres, Array.prototype.slice.call(arguments));};
    iopa["iopa.RemoveHeader"] = function(){this.reqres.removeHeader.apply(this.reqres, Array.prototype.slice.call(arguments));};
    iopa["iopa.WriteHead"] = function(){
      this.reqres.writeHead.apply(this.reqres, Array.prototype.slice.call(arguments));};

}
