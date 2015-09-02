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

An `IOPA` middleware/application is simply a `function(next)` that provides a single REST-server IOPA context for each request, where it is easy to access all the HTTP/COAP parameters  (`context.path`, `context.response.body` etc.).  "Tasks" (promises) are returned for full async programming without callbacks, and for compatibility with future ES7 async/await functionality.

Middleware can be chained with `app.use(middleware1).use(middleware2)` etc.

With the [`iopa-connect`](https://github.com/iopa-source/iopa-connect) package, `IOPA` servers can also call regular Node HTTP middleware in the same chain with `app.use( function(req,res){ ... }  )`. 

`IOPA` middleware and legacy middleware can be used with a COAP server such as [node-coap](https://github.com/mcollina/node-coap) with `app.buildCoap()` and can be used directly with Node's built-in http server with `app.buildHttp()` when used with the [`iopa-connect`](https://github.com/iopa-source/iopa-connect) package.    It can even be used in embedded webkit applications such as [nodekit.io](https://github.com/limerun/nodekit).


## For People, Animals, Devices and Things
`iopa` powers `nodekit.io`, an open-source cross-platform IOPA certified user interface framework for Mac, Windows, iOS, Android, Node.js, etc.   Anything that can be written as a web application or REST application can be run on a single device with no coding changes, in javascript.      As such IOPA is for communicating with people, animals, devices and things.

`iopa` also powers `limerun`, a cross-platform IOPA connected IoT framework for any device that runs Node.js (including Raspberry Pi, BeagleBone, etc. ).  As such iopa is for communicating things.


## NPM Package Contents

This repository contains a Node Package Manager (NPM) package with helper functions for:
 
* IOPA constants for commonly used properties
* AppBuilder for chaining middleware and applications, with automatic bridging to async-based Tasks (Promises), use of *this* for IopaContext instead of separate argument, and *next* argument for middleware chaining
* Context factory for creating your own IOPA contexts (typically used by a server)

This package is intended for use in Node.js applications that either run on a web server that conform to the IOPA specifications (such as the embedded webserver inside [nodekit.io](https://github.com/nodekit-io/nodekit)) or run using the iopa-coap, iopa-mqtt, and iopa-http bridges when used with those respective packages.

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


## Example Usage

### Installation
``` js
npm install iopa
```
 
### Basic Example
``` js
const iopa = require('./index'),
  IopaApp = iopa,
  iopaFactory = iopa.factory,
  iopaUtil = iopa.util,

  constants = iopa.constants,
  IOPA = constants.IOPA,
  SERVER = constants.SERVER,
  METHODS = constants.METHODS,
  PORTS = constants.PORTS,
  SCHEMES = constants.SCHEMES,
  PROTOCOLS = constants.PROTOCOLS,
  APP = constants.APP,
  COMMONKEYS = constants.COMMONKEYS,
  OPAQUE = constants.OPAQUE,
  WEBSOCKET = constants.WEBSOCKET,
  SECURITY = constants.SECURITY;

var app = new IopaApp();
app.use(function (context, next) {
  context.log.info("HELLO WORLD" + context.toString());
  return Promise.resolve(null);
});

var demo = app.build();

var context = iopaFactory.createContext();

demo(context);

iopaFactory.dispose(context); 
```
   
### Automatic Connect Bridge to Legacy Connect/Express Middleware and Node HTTP Server  
``` js
var iopa = require('iopa')
  , http = require('http')
  , iopaConnect = require('iopa-connect')
  
var app = new iopa.App();
app.use(iopaConnect);
app.use(function(req, res) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end("<html><head></head><body>Hello World</body>");
});
http.createServer(app.buildHttp()).listen(); 
```    

### IOPA - HTTP Bridge Only with IOPA Promise based middleware
    
``` js
var iopa = require('iopa'),
    http = require('http'),
    iopaConnect = require('iopa-connect');

var app = new iopa.App();
app.use(iopaConnect);
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
