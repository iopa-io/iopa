// Type definitions for iopa.io v1.0.0
// Project: http://iopa.io/
// Definitions by: Internet of Protocols Alliance <http://iopa.io>

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

declare module "iopa" {
    
     interface METHODS {
        GET: string,
        PUT: string,
        DELETE: string,
        POST: string,
    }
    
    interface PORTS {
        HTTP: number,
        HTTPS: number,
        COAP: number,
        COAPS: number,
        MQTT: number,
        MQTTS: number
    }

    interface SCHEMES {
        HTTP: string,
        HTTPS: string,
        COAP: string,
        COAPS: string,
        MQTT: string,
        MQTTS: string
    }

    interface PROTOCOLS {
        HTTP: string,
        COAP: string,
        MQTT: string,
    }
    
    interface EVENTS {
        Request: string,
        Response: string,
        Finish: string,
        Disconnect: string
    }
    
   interface CAPABILITIES {
        App: string, 
        Publish: string,
        Subscribe: string,
        Send: string,
        Observe: string,
        SendFile: string,
        Opaque: string,
        WebSocket: string
    }

    interface IOPA {
        Scheme: string,
        Method: string,
        PathBase: string,
        Path: string,
        QueryString: string,
        Protocol: string,
        Headers: string,
        Body: string,
        Host: string,

        response: string,
        StatusCode: string,
        ReasonPhrase: string,

        CallCancelled: string,

        Error: string,
        SetHeader: string,
        GetHeader: string,
        RemoveHeader: string,
        WriteHead: string,

        Id: string,
        Version: string,
        Seq: string,
        Events: string,
        HeadersSent: string,
        MessageId: string,
        Token: string,
        
        METHODS: METHODS,
        PORTS: PORTS,
        SCHEMES: SCHEMES,
        PROTOCOLS: PROTOCOLS,
        EVENTS: EVENTS,
        CAPABILITIES: CAPABILITIES
    }

    interface SERVER {
        Capabilities: string,
        Logger: string,
        CallCancelledSource : string,
        IsLocalOrigin: string,
        OriginalUrl: string,
        RemoteAddress: string,
        RemotePort: string,
        LocalAddress: string,
        LocalPort: string,
        RawStream: string,
        RawTransport: string, 
        IsRequest: string,
        SessionId: string,
        TLS: string,
        AppId: string,
        IsChild: string,
        Fetch: string,
        ParentContext: string,
        WriteAck: string,
        WriteErr: string,
        Retry: string,
        Version: string,
        Factory: string
     }
 
    interface APPBUILDER {
        AddSignatureConversion: string,
        DefaultApp: string,
        DefaultMiddleware: string
    }

    interface SENDFILE {
        Version: string,
        Support: string,
        Concurrency: string,
        SendAsync: string
    }

    interface OPAQUE {
        Version: string,
        Upgrade: string,
        Stream: string,
        CallCancelled: string,
    }

    interface WEBSOCKET {
        Version: string,
        Accept: string,
        SubProtocol: string,
        SendAsync: string,
        ReceiveAsync: string,
        CloseAsync: string,
        CallCancelled: string,
        ClientCloseStatus: string,
        ClientCloseDescription: string
    }

    interface SECURITY {
        ClientCertificate: string,
        User: string,
        Authenticate: string,
        SignIn: string,
        SignOut: string,
        Challenge: string
    }
    
    interface MQTT_METHODS {
        CONNECT: string,
        SUBSCRIBE: string,
        UNSUBSCRIBE: string,
        PUBLISH: string,
        PINGREQ: string,
        DISCONNECT: string,
        CONNACK: string,
        SUBACK: string,
        UNSUBACK: string,
        PUBACK: string,
        PUBREC: string,
        PUBREL: string,
        PUBCOMP: string,
        PINGRESP: string
    }
    
    interface MQTT_RETURN_CODES
    {
        0: string,
        1: string,
        2: string,
        3: string,
        4: string,
        5: string
    }
    
    interface MQTT {
        ProtocolId: string,
        ProtocolVersion: string,
        Clean: string,
        ClientId: string,
        KeepAlive: string,
        UserName: string,
        Password: string,
        Will: string,
        Qos: string,
        Subscriptions: string,
        Dup: string,
        Retain: string,
        SessionPresent: string,
        Granted: string,
        
        METHODS: MQTT_METHODS,
        RETURN_CODES: MQTT_RETURN_CODES
    }
    
    
    interface COAP_CODES {
        '0.01': string,
        '0.02': string,
        '0.03': string,
        '0.04': string,
    }

    interface COAP_METHODS {
        'GET': string,
        'POST': string,
         'PUT': string,
         'DELETE': string,
    }

    interface COAP_STATUS_CODES {
          "0.00": string, 
          "0.01": string,
          "0.02": string,
          "0.03": string,
          "0.04": string,
          "2.01": string,
          "2.02": string,
          "2.03": string,
          "2.04": string,
          "2.05": string,
          "4.00": string,
          "4.01": string,
          "4.02": string,
          "4.03": string,
          "4.04": string,
          "4.05": string,
          "4.06": string,
          "4.12": string,
          "4.13": string,
          "4.15": string,
          "5.00": string,
          "5.01": string,
          "5.02": string,
          "5.03": string,
          "5.04": string,
          "5.05": string
    }

    
    interface COAP {

        Ack: string,
        Reset: string,
        Confirmable: string,
        Code: string,
        Options: string,
    
        MAXPACKETSIZE: number,
        MULTICASTIPV4: string,
        MULTICASTIPV6: string,
        
        CODES: COAP_CODES,
        METHOS: COAP_METHODS,
        STATUS_CODES: COAP_STATUS_CODES
    }

    interface IopaConstants {
        IOPA: IOPA
        SERVER: SERVER,
        APPBUILDER: APPBUILDER,
        OPAQUE: OPAQUE,
        WEBSOCKET: WEBSOCKET,
        SECURITY: SECURITY,
        MQTT: MQTT,
        COAP: COAP
    }
    
    export class App{  
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
        
        constructor(properties?: any);
    }

    interface IopaContext extends Object {
        "IOPA.Version": string,
        "server.CallCancelledSource": any,
        "iopa.CallCancelled": any,
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
        * Create a new IOPA Request, based on the given URL and scheme
        */
        createRequest(urlStr: string, options: any): IopaContext;
        
        /**
        * Create a new IOPA Request with Response, based on the given URL and scheme
        */
        createRequestResponse(urlStr: string, options: any): IopaContext;
    
        /**
        * Create a new barebones IOPA Request without a response record
        */
        _create(): IopaContext;
        
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
        mergeContext(target, defaults): any;
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
}
