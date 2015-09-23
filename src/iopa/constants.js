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
 
exports.IOPA = {
    Scheme: "iopa.Scheme",
    Method: "iopa.Method",
    PathBase: "iopa.PathBase",
    Path: "iopa.Path",
    QueryString: "iopa.QueryString",
    Protocol: "iopa.Protocol",
    Headers: "iopa.Headers",
    Body: "iopa.Body",
    Host: "iopa.Host",

    response: "response",
    StatusCode: "iopa.StatusCode",
    ReasonPhrase: "iopa.ReasonPhrase",

    CallCancelled: "iopa.CallCancelled",

    Version: "iopa.Version",

    Error: "iopa.Error",
    SetHeader: "iopa.SetHeader",
    GetHeader: "iopa.GetHeader",
    RemoveHeader: "iopa.RemoveHeader",
    WriteHead: "iopa.WriteHead",
    HeadersSent: "iopa.HeadersSent",

    Id: "iopa.Id",
    Seq: "iopa.Seq",
    Events: "iopa.Events",
    MessageId: "iopa.MessageId",
    Token: "iopa.Token",

    METHODS: {
        connect: "urn:io.iopa.connect",
        data: "urn:io.iopa.data",
        GET: "GET",
        PUT: "PUT",
        DELETE: "DELETE",
        POST: "POST",
    },

    PORTS: {
        HTTP: 80,
        HTTPS: 443,
        COAP: 5683,
        COAPS: 5684,
        MQTT: 1883,
        MQTTS: 8883
    },

    SCHEMES: {
        HTTP: "http:",
        HTTPS: "https:",
        COAP: "coap:",
        COAPS: "coaps:",
        MQTT: "mqtt:",
        MQTTS: "mqtts:"
    },

    PROTOCOLS: {
        HTTP: "HTTP/1.1",
        COAP: "COAP/1.0",
        MQTT: "MQTT/3.1.1",
    },

    EVENTS: {
        Request: "request",
        Response: "response",
        Finish: "finish",
        Cancel: "cancel",
        Disconnect: "disconnect",
        Dispose: "dispose"
    },
    
    CAPABILITIES: {
        App: "urn:io.iopa:app",
        Publish: "urn:io.iopa:pubsub:publish",
        Subscribe: "urn:io.iopa:pubsub:subscribe",
        Send: "urn:io.iopa:send",
        Observe: "urn:io.iopa:observe",
        SendFile: "urn:io.iopa:sendfile",
        Opaque: "urn:io.iopa:opaque",
        WebSocket: "urn:io.iopa.websocket"
    },
    
    PUBSUB :
    {
        Clean: "pubsub.Clean",
        Subscribe: "pubsub.Subscribe",
        Publish: "pubsub.Publish",
    },
    
    SECURITY :
    {
    
        ClientCertificate: "ssl.ClientCertificate",
        // 3.2. Per Request
        User: "server.User",
        Authenticate: "security.Authenticate",
        
        // 3.3. Response
        SignIn: "security.SignIn",
        SignOut: "security.SignOut",
        Challenge: "security.Challenge"
    },
    
    SENDFILE :
        {
            Concurrency: "sendfile.Concurrency",
            SendAsync: "sendfile.SendAsync"
        }
};

exports.SERVER = {
    Capabilities: "server.Capabilities",
    Logger: "server.Logger",
    CallCancelledSource: "server.CallCancelledSource",
    IsLocalOrigin: "server.IsLocalOrigin",
    OriginalUrl: "server.OriginalUrl",
    RemoteAddress: "server.RemoteAddress",
    RemotePort: "server.RemotePort",
    LocalAddress: "server.LocalAddress",
    LocalPort: "server.LocalPort",
    RawStream: "server.RawStream",
    RawTransport: "server.RawTransport",
    IsRequest: "server.IsRequest",
    SessionId: "server.SessionId",
    TLS: "server.TLS",
    AppId: "server.AppId",
    IsChild: "server.IsChild",
    ParentContext: "server.ParentContext",
    Fetch: "fetch",
    Dispatch: "dispatch",
    WriteAck: "server.WriteAck",
    WriteErr: "server.WriteErr",
    Retry: "server.Retry",
    Version: "server.Version",
    Factory: "server.Factory",
    LocalThing: "server.LocalThing",
    RemoteThing: "server.RemoteThing"
};

exports.APPBUILDER =
{
    AddSignatureConversion: "app.AddSignatureConversion",
    DefaultApp: "app.DefaultApp",
    DefaultMiddleware: "app.DefaultMiddleware"
};


exports.OPAQUE =
{
    // 3.1. Startup
    
    Version: "opaque.Version",
    
    // 3.2. Per Request
    
    Upgrade: "opaque.Upgrade",
    
    // 5. Consumption
    
    Stream: "opaque.Stream",
    CallCancelled: "opaque.CallCancelled",
};

exports.WEBSOCKET =
{
    // 3.1. Startup
    Version: "websocket.Version",
    
    // 3.2. Per Request
    Accept: "websocket.Accept",
    
    // 4. Accept
    SubProtocol: "websocket.SubProtocol",
    
    // 5. Consumption
    SendAsync: "websocket.SendAsync",
    ReceiveAsync: "websocket.ReceiveAsync",
    CloseAsync: "websocket.CloseAsync",
    CallCancelled: "websocket.CallCancelled",
    ClientCloseStatus: "websocket.ClientCloseStatus",
    ClientCloseDescription: "websocket.ClientCloseDescription"
};

exports.MQTT = {
    ProtocolId: "mqtt.ProtocolId",
    ProtocolVersion: "mqtt.ProtocolVersion",
    Clean: "mqtt.Clean",
    ClientId: "mqtt.ClientId",
    KeepAlive: "mqtt.KeepAlive",
    UserName: "mqtt.UserName",
    Password: "mqtt.Password",
    Will: "mqtt.Will",
    Qos: "mqtt.Qos",
    Subscriptions: "mqtt.Subscriptions",
    Dup: "mqtt.Dup",
    Retain: "mqtt.Retain",
    SessionPresent: "mqtt.SessionPresent",
    Granted: "mqtt.Granted",

    METHODS: {
        CONNECT: "CONNECT",
        SUBSCRIBE: "SUBSCRIBE",
        UNSUBSCRIBE: "UNSUBSCRIBE",
        PUBLISH: "PUBLISH",
        PINGREQ: "PINGREQ",
        DISCONNECT: "DISCONNECT",
        CONNACK: "CONNACK",
        SUBACK: "SUBACK",
        UNSUBACK: "UNSUBACK",
        PUBACK: "PUBACK",
        PUBREC: "PUBREC",
        PUBREL: "PUBREL",
        PUBCOMP: "PUBCOMP",
        PINGRESP: "PINGRESP"
    },
    
    RETURN_CODES:
    {
    0: 'OK',
    1: 'Unacceptable protocol version',
    2: 'Identifier rejected',
    3: 'Server unavailable',
    4: 'Bad user name or password',
    5: 'Not authorized',
    }

};

exports.COAP = {

    Ack: "coap.Ack",
    Reset: "coap.Reset",
    Confirmable: "coap.Confirmable",
    Code: "coap.Code",
    Options: "coap.Options",

    MAXPACKETSIZE: 1280,
    MULTICASTIPV4: "224.0.1.187",
    MULTICASTIPV6: "FF0X::FD",


    CODES: {
        '0.01': 'GET'
        , '0.02': 'POST'
        , '0.03': 'PUT'
        , '0.04': 'DELETE'
    },

    METHODS: {
        'GET': '0.01'
        , 'POST': '0.02'
        , 'PUT': '0.03'
        , 'DELETE': '0.04'
    },

    STATUS_CODES: {
        // Empty Message
        "0.00": "Empty" 
    
    // Class 0: Request Methods
        , "0.01": "GET"
        , "0.02": "POST"
        , "0.03": "PUT"
        , "0.04": "DELETE"
    
    // Class 2: Success Responses
        , "2.01": "Created"
        , "2.02": "Deleted"
        , "2.03": "Valid"
        , "2.04": "Changed"
        , "2.05": "Content"
    
    // Class 4: Client Errors
        , "4.00": "Bad Request"
        , "4.01": "Unauthorized"
        , "4.02": "Bad Option"
        , "4.03": "Forbidden"
        , "4.04": "Not Found"
        , "4.05": "Method Not Allowed"
        , "4.06": "Not Acceptable"
        , "4.12": "Precondition Failed"
        , "4.13": "Request Entity Too Large"
        , "4.15": "Unsupported Content-Format"
    
    // Class 5: Server Errors
        , "5.00": "Internal Server Error"
        , "5.01": "Not Implemented"
        , "5.02": "Bad Gateway"
        , "5.03": "Service Unavailable"
        , "5.04": "Gateway Timeout"
        , "5.05": "Proxying Not Supported"
    }
}