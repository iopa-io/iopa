# [![IOPA](https://iopa.io/iopa.png)](https://iopa.io)<br> IOPA

[![NPM](https://img.shields.io/badge/iopa-certified-99cc33.svg?style=flat-square)](https://iopa.io/)

[![NPM](https://nodei.co/npm/iopa.png?downloads=true&downloadRank=true)](https://nodei.co/npm/iopa/)

## About

This repository `iopa` is an API-first, Internet of Things (IoT) fabric
It is the official implementation of the Internet Open Protocol Alliance (IOPA) reference pattern

## Target Audience

This repository is primarily geared at application developers and device developers who want to connect their products to the Internet of Things, but don't want
to be tied down to any one protocol or standard (be it hardware or software based). Further, they want to have a simple "all data flows one way" approach to
developing applications or device logic, with a fabric that encourages good programming patterns and discourages anti-patterns. They don't want to reinvent the
wheel and therefore want all boilerplate and common logic for implementing a server to be simple use statements:

### Pseudo-code

```js
// DEFINE TRANSPORT LAYERS
app.use(tcp)
app.use(udp)
app.use(websockets)

// ADD SECURITY LAYERS
app.use(tls)
app.use(cors)

// DEFINE PROTOCOL LAYERS
app.use(mqtt)
app.use(coap)

// ADD APPLICATION LOGIC
app.mount('/device/lightswitch', function(context, next) {
  if ((context.get("iopa.Method) = 'ON')) this.lightswitch.turnon
})
```

## Pattern, Standards, Fabrics and Frameworks.

[IOPA](https://github.com/iopa-io/iopa-spec) is neither a protocol STANDARD nor a FRAMEWORK. Rather it is a PATTERN that defines a well-defined API (by convention not reference)
between the broadest scope of Internet of Things (IoT) transport layers and application/device logic. The reference implementation is a fabric that speeds development of applications
that use the pattern, but is not necessary to implement or to interoperate with any other application, or middleware micro-service -- it just provides some very handy reference classes and
constants for intellisense development, and provides a robust, tested example of the most common logic required (a dispatcher called the AppBuilder class, and a factory for creating
IOPA context with automatic scope tracking).

IOPA is a loose port of the [OWIN](http://owin.org) specification to expand the reach to Node.js servers but is language independent. The pattern works for Typescript,
Node.js javascript (including V12.0+), browser-side javascript, edge cloud function javascript, Swift V5., Objective-C and Golang. The reference implementation is written in Typescript.

Published as open-source without dependence on any implementation or platform, the IOPA specs allow applications to be developed independently of the actual server (nGinX, IIS, Node.js, Katana, node-coap, iopa-mqtt, iopa-coap, iopa-http, etc.).
Because it is a well-defined pattern that uses only base language features it is not even necessary to include this repository in any microservices that rely on it. The entire
pattern works using well-known string constants (published in the open-source [IOPA](https://github.com/iopa-io/iopa-spec) specification). However, inclusion of this repository gives access to intellisense, constant optimization, etc.

In contrast to the [IOPA](https://github.com/iopa-io/iopa-spec) _specification_, this repository contains an **actual** IOPA reference **implementation** for Typescript.

A broad ecosystem of servers and middleware, such as routers and view engines, exist in the the [iopa-io](https://github.com/iopa-io] and [limerun](https://github.com/limerun] organizations on GitHub.

## Core Principles

An `IOPA` middleware/application is simply a `function(context, next)` that we call an "AppFunc" that provides a single REST-like IOPA context for each request, where it is easy to access all the HTTP/COAP parameters (`context.path`, `context.response.body` etc.). "Tasks" (promises) are returned for full async programming without callback hell, and for full compatibility with the ES6+ async/await functionality.

Middleware can be chained with `app.use(middleware1).use(middleware2)` etc.

With the [`iopa-connect`](https://github.com/iopa-io/iopa-connect) package, `IOPA` servers can also call legacy Node HTTP middleware in the same chain with `app.use( function(req,res){ ... } )`.

`IOPA` middleware and legacy middleware can be used with a COAP server such as [node-coap](https://github.com/mcollina/node-coap) with `app.buildCoap()` and can be used directly with Node's built-in http server with `app.buildHttp()` when used with the [`iopa-connect`](https://github.com/iopa-io/iopa-connect) package. It can even be used in embedded webkit applications such as [nodekit.io](https://github.com/limerun/nodekit).

## Static Typings Design Time Experience

The version 3.0 upgrade of the iopa reference implementation added in ~2020 is in TypeScript and allows static type checking within IDEs such as Visual Studio Code of both `"server.Capabilities"` and the `context` record.

Use `app.capability("urn:io.iopa:my.great.capability")` and `app.setCapability("urn:io.iopa:my.great.capability", this)` to get and set capabilities on strongly typed `App` objects.

use `context['iopa.Headers].get('iopa.StatusCode')`, `context.response['iopa.Headers].set('iopa.StatusCode', 'awseast-205020-55')`, `context.capability('urn:io.iopa:my.great.capability')` to get field, set a field, and get a capability respectively.

Contribute to `iopa-types` with globally used reference capabilities and field definitions (kept in a separate repository so that the core `iopa` package stays relatively stable)

Use of square brackets (e.g., `context["iopa.StatusCode"]`) and reference constants (e.g., `IOPA.StatusCode`) is now discouraged due to the inability to check valid values at design time. The `get`, `set`, `capability`, and `setCapability` are automatically limited to correct values through a `keyof` limiter in the Typescript definitions.

## For People, Animals, Devices and Things

`iopa` powers `nodekit.io`, an open-source cross-platform IOPA certified user interface framework for Mac, Windows, iOS, Android, Node.js, etc. Anything that can be written as a web application or REST application can be run on a single device with no coding changes, in javascript. As such IOPA is for communicating with people, animals, devices and things.

## NPM Package Contents

This repository contains a Node Package Manager (NPM) package with helper components for:

- AppBuilder dispatcher for chaining middleware and applications, with automatic bridging to async-based Tasks (Promises), use of _this_ for IopaContext instead of separate argument, and _next_ argument for middleware chaining
- Context factory for creating your own IOPA contexts (typically used by a server)
- IOPA constants for commonly used properties (now deprecated as static type languages such as Typescript are preferred)

This package is intended for use in browser workers, cloud functions, embedded mobile runtimes, and deno or Node.js applications that either run on a web server that conform to the IOPA specifications (such as the embedded webserver inside [nodekit.io](https://github.com/nodekit-io/nodekit)) or run using the iopa-coap, iopa-mqtt, and iopa-http bridges when used with those respective packages.

## Middleware/Application Pipeline Creator and Dispatcher: AppBuilder

```js
app.use(MiddlewareClass)
```

Adds a Middleware node to the IOPA function pipeline. The middleware are
invoked in the order they are added: the first middleware passed to `app.use` will
be the outermost function, and the last middleware passed to Use will be the
innermost.

### MiddlewareClass

The middlewareclass parameter determines which behavior is being chained into the pipeline.

- If the middleware given to use is a constructor that takes **one** argument, then it will be invoked with as a new instance with the `app` provided as the only parmaeter to the constructor. The class MAY also contain an `invoke` instance function that is invoked for each subsequent context record.

- If the middleware given to use is a function that takes **one** argument, then it will be invoked with the `next` component in the chain as its parameter, and with the `this` context set to the IOPA context. It MUST return a promise that conforms to the Promise/A specification.

- If the middleware given to use is a function that takes **two** arguments, then it will be invoked with the `next` component in the chain as its parameter, with a Node-based callback (`function(err, result){}`)as its second parameter, and with the `this` context set to the IOPA context. This type of middleware should return void.

### returns app

The AppBuilder `app` itself is returned. This enables you to chain your use statements together.

### build pipeline when all middleware added:

```js
app.build()
```

returns an IOPA AppFunc `(promise) function(context)` that can be inserted into any IOPA server.

## Example Usage

### Installation

```js
yarn add iopa
```

### Basic Example

```js
import { App, Factory } as Iopa = from 'iopa'

var app = new App()
app.use(async (context, next) => {
  console.log.info('HELLO WORLD' + context.toString())
  return next()
})

var demo = app.build()

var context = new Factory().createContext() // typically done within a TCP or UDP server

context.using(demo) // the using automatically disposes of the context (returning it to a pool) when demo AppFunc is complete
```

### Automatic Connect Bridge to Legacy Connect/Express Middleware and Node HTTP Server

```js
var iopa = require('iopa'),
  http = require('http'),
  iopaConnect = require('iopa-connect')

var app = new iopa.App()
app.use(iopaConnect)
app.use(function(req, res) {
  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.end('<html><head></head><body>Hello World</body>')
})
http.createServer(app.buildHttp()).listen()
```

### IOPA - HTTP Bridge Only with IOPA Promise based middleware

```js
var iopa = require('iopa'),
  http = require('http'),
  iopaConnect = require('iopa-connect')

var app = new iopa.App()
app.use(iopaConnect)
app.use(function(next) {
  this.response.writeHead(200, { 'Content-Type': 'text/html' })
  this.response.end('<html><head></head><body>Hello World</body>')
  return next()
})
http.createServer(app.buildHttp()).listen()
```

## Definitions

- **appFunc** = `(Promise) function(context)`
- **app.use** = `(app)function(middleware)`
- **middleware** = `(Promise) function(context, next)` with `next`=**appFunc**
- OR **middleware** = `fn(req, res, next)` for compatibility with Connect/ExpressJS middleware
- OR **middleware** = `fn(err, req, res, next)` for compatibility with Connect/ExpressJS middleware
- **app.build** = `(appFunc) function(context)` // builds middleware
- **app.buildHttp** = `(function(req, res)) function()` // builds middleware for compatibility with Connect/ExpressJS hosts
- **context** = IOPA context dictionary

## API Reference Specification

[![IOPA](https://iopa.io/iopa.png)](https://iopa.io)

[`IOPA-docs/IOPA-spec`](https://github.com/iopa-io/iopa-spec/blob/master/Specification.md)
