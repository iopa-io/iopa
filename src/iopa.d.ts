// Type definitions for iopa.io v1.4.0
// Project: http://iopa.io/
// Definitions by: Internet of Protocols Alliance <http://iopa.io>

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

/************************************************
*                                               *
*               iopa.io v1.0.0 API              *
*                                               *
************************************************/

/************************************************
*                                               *
*                   MODULES                     *
*                                               *
************************************************/

interface ACTIONS {
    data: string,
    GET: string,
    PUT: string,
    DELETE: string,
    POST: string,
}


interface CAPABILITIES {
    App: string,
 }


interface IOPA {
    Method: string,
    Path: string,
    Body: string,
    QueryString: "iopa.QueryString",
    Protocol: "iopa.Protocol",
  
    CancelToken: string,

    Error: string,

    Version: string,
    Seq: string,
    Events: string,
 
    ACTIONS: ACTIONS,
    CAPABILITIES: CAPABILITIES
  }

interface SERVER {
    Id: string,
    Capabilities: string,
    IsBuilt: string,
    Pipeline: string,
    Logger: string,
    Factory: string,
    CancelTokenSource: string,
    AppId: string,
    IsChild: string,
    ParentContext: string,
}

interface APPBUILDER {
    DefaultApp: string,
    DefaultMiddleware: string
}

interface IopaConstants {
    IOPA: IOPA
    SERVER: SERVER,
    APPBUILDER: APPBUILDER,
}

export class App {
    /**
    * Add IOPA Middleware Function to AppBuilder pipeline
    *
    * @param mw the middleware to add 
    */
    use(mw: (context, next) => any): App;


    /**
    * Add IOPA Middleware Function to AppBuilder pipeline
    *
    * @param mw the middleware to add 
    */
    use(mw: (next) => any): App;

    /**
    * Add Connect Middleware Function to AppBuilder pipeline
    *
    * @param mw the middleware to add 
    */
    use(mw: (req, res) => any): App;

    /**
    * Add Connect Middleware Function to AppBuilder pipeline
    *
    * @param mw the middleware to add 
    */
    use(mw: (req, res, next) => any): App;

    /**
    * Add IOPA Middleware Function to AppBuilder pipeline
    *
    * @param mw the middleware to add 
    */
    use(mw: (app) => any): App;

    /***
    * Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
    */
    build(): () => ((context) => any);

    /***
    * Start listening
    */
    listen(options: any ): any;

    constructor(properties?: any);
}

interface IopaContext extends Object {
    "IOPA.Version": string,
    "server.CancelTokenSource": any,
    "iopa.CancelToken": any,
    "iopa.Events": any,
    "iopa.Seq": any,
    "server.Logger": any,
    "dispose": () => void,
    "using": (any) => Promise<any>,
}

export class Factory {

    /**
     * Create a new IOPA Context, with default [iopa.*] values populated
     */
    createContext(): IopaContext;

    /**
     * Create a new IOPA Child Context for given parent context
     */
    createChildContext(parentContext: IopaContext, url?: string, options?: any): IopaContext;

    /**
    * Release the memory used by a given IOPA Context
    *
    * @param context the context to free 
    */
    _dispose(context: IopaContext): void;

    constructor(options?: any);
}


interface shallow {
    merge(target, defaults): any;
    copy(source, target): any;
    clone(source): any;
    clone(source, blacklist): any;
}

interface iopaPrototype {
    cloneKeyBehaviors(targetObjectPrototype, sourceObjectprototype, iopaContextKey: string, response: boolean): void;
}

interface IopaUtils {
    shallow: shallow,
    prototype: iopaPrototype
}

export var constants: IopaConstants;
export var util: IopaUtils;
