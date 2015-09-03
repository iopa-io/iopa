// Type definitions for iopa.io v1.0.0
// Project: http://iopa.io/
// Definitions by: Limerun Project <http://limerun.com>, DefinitelyTyped <https://github.com/borisyankov/DefinitelyTyped>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/************************************************
*                                               *
*               iopa.io v1.0.0 API              *
*                                               *
************************************************/

/************************************************
*                                               *
*                   GLOBAL                      *
*                                               *
************************************************/

/************************************************
*                                               *
*                   MODULES                     *
*                                               *
************************************************/

declare module "iopa" {
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

        IopaVersion: string,

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
        IsRequest: string,
        SessionId: string,
        TLS: string,
        AppId: string,
        IsChild: string
    }

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

    interface APP {
        AddSignatureConversion: string,
        DefaultApp: string,
        DefaultMiddleware: string
    }

    interface COMMONKEYS {
        ClientCertificate: string,
        RemoteAddress: string,
        RemotePort: string,
        LocalAddress: string,
        LocalPort: string,
        IsLocalOrigin: string,
        TraceOutput: string,
        Addresses: string,
        AppName: string,
        Capabilities: string,
        OnSendingHeaders: string,
        OnAppDisposing: string,
        Scheme: string,
        Host: string,
        Port: string,
        Path: string,
        AppId: string,
        CallCancelledSource: string
    }

    interface SENDFILE {
        Version: string,
        Support: string,
        Concurrency: string,
        SendAsync: string
    };

    interface OPAQUE {
        Version: string,
        Upgrade: string,
        Stream: string,
        CallCancelled: string,
    };

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
        User: string,
        Authenticate: string,
        SignIn: string,
        SignOut: string,
        Challenge: string
    };

    interface IopaConstants {
        IOPA: IOPA
        SERVER: SERVER,
        METHODS: METHODS,
        PORTS: PORTS,
        SCHEMES: SCHEMES,
        PROTOCOLS: PROTOCOLS,
        APP: APP,
        COMMONKEYS: COMMONKEYS,
        OPAQUE: OPAQUE,
        WEBSOCKET: WEBSOCKET,
        SECURITY: SECURITY;
    }

    export class IopaAppBuilder {
        use(mw: (context, next) => any): IopaAppBuilder;
        use(mw: (next) => any): IopaAppBuilder;
        use(mw: (req, res) => any): IopaAppBuilder;
        use(mw: (req, res, next) => any): IopaAppBuilder;
        use(mw: (app) => any): IopaAppBuilder;
        build(): void;
        constructor(properties?: any);
    }
    
    export class app extends IopaAppBuilder{  
         use(mw: (context, next) => any): IopaAppBuilder;
        use(mw: (next) => any): IopaAppBuilder;
        use(mw: (req, res) => any): IopaAppBuilder;
        use(mw: (req, res, next) => any): IopaAppBuilder;
        use(mw: (app) => any): IopaAppBuilder;
        build(): (context: any) => any;
        constructor(properties?: any);
    }

    interface IopaContext extends Object { };

    interface IopaFactory {
        dispose(context: IopaContext): void;
        createContext(): IopaContext;
        createRequest(urlStr: string, method: string): IopaContext;
        _create(withoutResponse: boolean): IopaContext;
    }


    interface shallow {
        merge(source, defaults): any;
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
    export var factory: IopaFactory;
    export var util: IopaUtils;
}

