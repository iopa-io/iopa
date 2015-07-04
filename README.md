# [![IOPA](http://iopa.io/iopa.png)](http://iopa.io)<br> IOPA

[![Build Status](https://api.shippable.com/projects/5598664dedd7f2c05258ed34/badge?branchName=master)](https://app.shippable.com/projects/5598664dedd7f2c05258ed34)
[![NPM](https://img.shields.io/badge/iopa-certified-99cc33.svg?style=flat-square)](http://iopa.io/)
[![limerun](https://img.shields.io/badge/limerun-certified-3399cc.svg?style=flat-square)](https://nodei.co/npm/limerun/)

[![NPM](https://nodei.co/npm/iopa.png?downloads=true)](https://nodei.co/npm/iopa/)

## About
The Node.js package `iopa` is the reference implementation for IOPA, a lightweight REST framework for the Internet of Protocols.  

It is an open-source, standards-based, drop-in replacement for Connect, Express, and Koa, with built-in seamless bridging to Node's built-in HTTP server, COAP servers such as [`node-coap`](https://github.com/mcollina/node-coap), and native IOPA servers such as [nodekit.io](https://github.com/limerun/nodekit)

The [IOPA](https://github.com/iopa-source/iopa-spec) specification defines a standard interface between Node.js REST servers and application/device logic.   These include HTTP servers for web applications and COAP servers for Internet of Things (IOT) devices.

In fact, IOPA is a loose port of the [OWIN](http://owin.org) specification to expand the reach to Node.js servers but is language independent.

Published as open-source standards without dependence on any implementation or platform , the IOPA specs allow applications to be developed independently of the actual server (nGinX, IIS, Node.js, Katana, node-coap, iopa-mqtt, iopa-coap, iopa-http, etc.)

In contrast to the [IOPA](https://github.com/iopa-source/iopa-spec) *specification*, this repository contains an **actual** IOPA reference **implementation** for node.js Javascript.  

A broad ecosystem of servers and middleware, such as routers and view engines, exist in the the [limerun Organization](https://github.com/limerun] on GitHub.


## Summary

An `IOPA` middleware/application is simply a `function(next)` that provides a single REST-server IOPA context for each request, where it is easy to access all the HTTP/COAP parameters  (`context.path`, `context.response.body` etc.).  "Tasks" (promises) are returned for full async programming without callbacks.

Middleware can be chained with `app.use(middleware1).use(middleware2)` etc.

`IOPA` servers can also call regular Node HTTP middleware in the same chain with `app.use( function(req,res){ ... }  )`. 

`IOPA` middleware and legacy middleware can be used with a COAP server such as [node-coap](https://github.com/mcollina/node-coap) with `app.buildCoap()` and can be used directly with Node's built-in http server with `app.buildHttp()`.    It can even be used in embedded webkit applications such as [nodekit.io](https://github.com/limerun/nodekit).


## For People, Animals, Devices and Things
`iopa` powers `nodekit.io`, an open-source cross-platform IOPA certified user interface framework for Mac, Windows, iOS, Android, Node.js, etc.   Anything that can be written as a web application or REST application can be run on a single device with no coding changes, in javascript.      As such IOPA is for communicating with people, animals, devices and things.

`iopa` also powers `limerun`, a cross-platform IOPA connected IoT framework for any device that runs Node.js (including Raspberry Pi, BeagleBone, etc. ).  As such iopa is for communicating things.


## NPM Package Contents

This repository contains a Node Package Manager (NPM) package with helper functions for:
 
* AppBuilder for chaining middleware and applications, with automatic bridging to async-based Tasks (Promises conforming to Promise/A specification), use of *this* for IopaContext instead of separate argument, and *next* argument for middleware chaining
* Connect app bridge: An IOPA -> Connect/Express application bridge
* HTTP server bridge:  A Node.js Http Server --> IOPA application bridge
* COAP server bridge:  A node-coap Server --> IOPA application bridge
* Promise:  Includes a dependency to the [bluebird](https://github.com/petkaantonov/bluebird) implementation which can be used by all other IOPA applications and middleware

This package is intended for use in Node.js applications that either run on a web server that conform to the IOPA specifications (such as the embedded webserver inside [nodekit.io](https://github.com/nodekit-io/nodekit)) or run using the included iopa-coap and iopa-http bridge for node-coap and node Http servers respectively.

## Middleware/Application Pipeline Builder: AppBuilder 
```js
app.use(middleware)
```

Adds a middleware node to the IOPA function pipeline. The middleware are
invoked in the order they are added: the first middleware passed to `app.use` will
be the outermost function, and the last middleware passed to Use will be the
innermost.

### middleware
The middleware parameter determines which behavior is being chained into the pipeline. 

* If the middleware given to use is a function that takes **one** argument, then it will be invoked with the `next` component in the chain as its parameter, and with the `this` context set to the IOPA context.  It MUST return a promise that conforms to the Promise/A specification.

* If the middleware given to use is a function that takes **two** arguments, then it will be invoked with the `next` component in the chain as its parameter, with a Node-based callback (`function(err, result){}`)as its second parameter, and with the `this` context set to the IOPA context.  This type of middleware should return void.

* Legacy middleware can also be invoked with  `app.use( function(req,res){ ... }  )`, `app.use( function(req, res, next){ ... }  )` or `app.use( function(err, req, res, next){ ... }  )`.  The AppBuilder is smart enough to detect the two argument function with parameters named req and res in this case (use of different naming conventions need to be wrapped in a `function(req,res){}`), and assumes three and four argument functions are legacy.


### returns app
The AppBuilder `app` itself is returned. This enables you to chain your use statements together.

### build pipeline when all middleware added:
```js
app.build()
```
returns an IOPA AppFunc `(promise) function(context)` that can be inserted into any IOPA server.

## Bridges

Three simple functions `iopa.connect()`, `iopa.COAP()` and `iopa.REST()` are provided to bridge between IOPA context applications/middleware and Node.js COAP and HTTP REST-style `function(req,res)` based  applications/middleware.   Often these are not used directly as the AppBuilder functionality automatically wraps legacy middleware and can even return a node.js-ready pipeline with `.buildREST()`

Note: The bridges are low overhead functions, binding by reference not by value wherever possible, so middleware can be interwoven throughout the pipeline, and open up the IOPA world to the entire Connect/Express based ecosystem and vice versa.   

We have not ported to Koa, Mach, Kraken or other similar frameworks but it would be relatively straightforward to do so.

* `iopa.connect()` consumes a Connect-based application function (one that would normally be passed to the http.CreateServer method) and returns an IOPA **AppFunc**.
* `iopa.http()` consumes an IOPA **AppFunc** and returns a function (that takes http.requestMessage and http.requestMessage as arguments) and one that can be passed directly to the http.createServer method    
* `app.buildHttp()` is syntactic sugar to build the pipleine and returns a node.js-ready function (that takes http.requestMessage and http.requestMessage as arguments) and one that can be passed directly to the http.createServer method   
* `iopa.coap()` consumes an IOPA **AppFunc** and returns a function (that takes http.requestMessage and http.requestMessage as arguments) and one that can be passed directly to the http.createServer method    
* `app.buildCoap()` is syntactic sugar to build the pipleine and returns a node-coap-ready function (that takes req and res as arguments) and one that can be passed directly as server.on('request', ____) event handler   




## Example Usage

### Installation
``` js
npm install iopa
```

#### To run HTTP demo:
``` js
git clone https://github.com/limerun/iopa.git
cd iopa
npm install
node demo.js
```
    
### Hello World Example
``` js
const iopa = require('iopa')
    , http = require('http');
var app = new iopa.App();
app.use(function(context, next){
       context.response["iopa.WriteHead"](200, {'Content-Type': 'text/html'});
    context.response["iopa.Body"].end("<html><head></head><body>Hello World from HTTP Server</body>");
     return next();
    });
http.createServer(app.build()).listen(); 
```
   
### Automatic Connect Bridge to Legacy Connect/Express Middleware    
``` js
var iopa = require('iopa')
  , http = require('http');
var app = new iopa.App();  
app.use(function(req, res) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end("<html><head></head><body>Hello World</body>");
});
http.createServer(app.build()).listen(); 
```    

### IOPA - HTTP Bridge
    
``` js
var iopa = require('iopa')
  , http = require('http'); 
var http = require('http');
var app = new iopa.App();
app.use(function(next){
    this.response.writeHead(200, {'Content-Type': 'text/html'});
    this.response.end("<html><head></head><body>Hello World</body>");
return next();
});
http.createServer(app.buildHttp()).listen();
```  

## Definitions

 * **appFunc** = `(Promise) function(context)` 
 * **app.use** = `(app)function(middleware)`
 * **middleware** = `(Promise) function(context, next)` with `next`=**appFunc**
 * OR **middleware** = `fn(req, res, next)` for compatibility with Connect/ExpressJS middleware
 * OR **middleware** = `fn(err, req, res, next)` for compatibility with Connect/ExpressJS middleware
 * **app.build** = `(appFunc) function(context)`   // builds middleware 
 * **app.buildHttp** = `(function(req, res)) function()`   // builds middleware for compatibility with Connect/ExpressJS hosts
 * **context** = IOPA context dictionary

## API Reference Specification

[![IOPA](http://iopa.io/iopa.png)](http://iopa.io)
 
[`IOPA-docs/IOPA-spec`](https://github.com/iopa-source/iopa-spec/blob/master/Specification.md)
