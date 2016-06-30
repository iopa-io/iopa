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

exports.IOPA = {

    Method: "iopa.Method",
    Path: "iopa.Path",
    Body: "iopa.Body",
    QueryString: "iopa.QueryString",
    Protocol: "iopa.Protocol",
   
    Version: "iopa.Version",
    Error: "iopa.Error",
    Seq: "iopa.Seq",

    Scheme: "iopa.Scheme",
    PathBase: "iopa.PathBase",
    Headers: "iopa.Headers",
    Host: "iopa.Host",
    Trailers: "iopa.Trailers",

    response: "response",
    StatusCode: "iopa.StatusCode",
    ReasonPhrase: "iopa.ReasonPhrase",

    CancelToken: "iopa.CancelToken",

    Set: "iopa.Set",
    Function: "iopa.Function",
    SetHeader: "iopa.SetHeader",
    GetHeader: "iopa.GetHeader",
    RemoveHeader: "iopa.RemoveHeader",
    WriteHead: "iopa.WriteHead",
    HeadersSent: "iopa.HeadersSent",

    Id: "iopa.Id",
    Events: "iopa.Events",
    MessageId: "iopa.MessageId",
    Token: "iopa.Token",

    METHODS: {
        connect: "urn:io.iopa:connect",
        data: "urn:io.iopa:data",
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
        Disconnect: "disconnect",   // used for cancelToken not events primarily
        Finish: "finish"  // used for cancelToken not events primarily
    },

    CAPABILITIES: {
        App: "urn:io.iopa:app",
        Publish: "urn:io.iopa:pubsub:publish",
        Subscribe: "urn:io.iopa:pubsub:subscribe",
        DiscoveryServer: "urn:io.iopa:discovery:server",
        DiscoveryClient: "urn:io.iopa:discovery:client",
        Send: "urn:io.iopa:send",
        Observe: "urn:io.iopa:observe",
        SendFile: "urn:io.iopa:sendfile",
        Opaque: "urn:io.iopa:opaque",
        WebSocket: "urn:io.iopa.websocket",
        Udp: "urn:io.iopa.udp",
        Tcp: "urn:io.iopa.tcp",
        Templates: "urn:io.iopa.templates"
    },

    PUBSUB:
    {
        Clean: "pubsub.Clean",
        Subscribe: "pubsub.Subscribe",
        Publish: "pubsub.Publish",
    },

    DISCOVERY: {
        Hello: "discovery.Hello",
        Probe: "discovery.Probe",
        Resolve: "discovery.Resolve",
        Bye: "discovery.Bye"
    },

    SECURITY:
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

    SENDFILE:
    {
        Concurrency: "sendfile.Concurrency",
        SendAsync: "sendfile.SendAsync"
    },

};

exports.SERVER = {

  //  Id: "server.Id",
  //  Capabilities: "server.Capabilities",
  //  IsBuilt: "server.IsBuilt",
  //  Pipeline: "server.Pipeline",
  //  Logger: "server.Logger",
  //  Factory: "server.Factory",
  //  CancelToken: "server.CancelToken",
  //  CancelTokenSource: "server.CancelTokenSource",
  //  Events: "server.Events",
  //  AppId: "server.AppId",
  //  IsChild: "server.IsChild",
  //  ParentContext: "server.ParentContext",

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
    WriteAck: "server.WriteAck",
    WriteErr: "server.WriteErr",
    Retry: "server.Retry",
    Version: "server.Version",
    LocalThing: "server.LocalThing",
    RemoteThing: "server.RemoteThing",
    IsMulticast: "server.IsMulticast",
    LocalPortType: "server.LocalPortType",
    LocalPortReuse: "server.LocalPortReuse",
    UnicastServer: "server.UnicastServer",
    MulticastPort: "server.MulticastPort",
    MulticastAddress: "server.MulticastAddress",
    RenderTemplate: "server.RenderTemplate"
  };

exports.APPBUILDER =
{
    AddSignatureConversion: "app.AddSignatureConversion",
    // DefaultApp: "app.DefaultApp",
    // DefaultMiddleware: "app.DefaultMiddleware"
};


exports.OPAQUE =
{
    // 3.1. Startup
    
    Version: "opaque.Version",
    
    // 3.2. Per Request
    
    Upgrade: "opaque.Upgrade",
    
    // 5. Consumption
    
    Stream: "opaque.Stream",
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
    ClientCloseStatus: "websocket.ClientCloseStatus",
    ClientCloseDescription: "websocket.ClientCloseDescription"
};
