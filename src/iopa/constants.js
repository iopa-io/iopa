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
    Scheme : "iopa.Scheme",
    Method : "iopa.Method",
    PathBase : "iopa.PathBase",
    Path : "iopa.Path",
    QueryString : "iopa.QueryString",
    Protocol : "iopa.Protocol",
    Headers : "iopa.Headers",
    Body : "iopa.Body",
    Host : "iopa.Host",
   
    response : "response",
    StatusCode : "iopa.StatusCode",
    ReasonPhrase : "iopa.ReasonPhrase",
    
    CallCancelled : "iopa.CallCancelled",
  
    IopaVersion : "iopa.Version",

    Error : "iopa.Error",
    SetHeader : "iopa.SetHeader",
    GetHeader : "iopa.GetHeader",
    RemoveHeader : "iopa.RemoveHeader",
    WriteHead : "iopa.WriteHead",
    HeadersSent: "iopa.HeadersSent",
    
    Id: "iopa.Id",
    Version: "iopa.Version",
    Seq: "iopa.Seq",
    Events: "iopa.Events",
    MessasgeId: "iopa.MessageId",
};

exports.SERVER = {
    Capabilities: "server.Capabilities",
    Logger: "server.Logger",
    CallCancelledSource : "server.CallCancelledSource",
    IsLocalOrigin: "server.IsLocalOrigin",
    OriginalUrl: "server.OriginalUrl",
    RemoteAddress: "server.RemoteAddress",
    RemotePort: "server.RemotePort",
    LocalAddress: "server.LocalAddress",
    LocalPort: "server.LocalPort",
    RawStream: "server.RawStream",
    IsRequest: "server.IsRequest",
    SessionId: "server.SessionId",
    TLS: "server.TLS",
    AppId: "server.AppId",
    IsChild: "server.IsChild",
    InProcess: "server.InProcess",
    Fetch: "fetch"
};

exports.METHODS = {
    GET: "GET",
    PUT: "PUT",
    DELETE: "DELETE",
    POST: "POST",
}

exports.PORTS = {
    HTTP: 80,
    HTTPS: 443,
    COAP: 5683,
    COAPS: 5684,
    MQTT: 1883,
    MQTTS: 8883
}

exports.SCHEMES = {
    HTTP: "http:",
    HTTPS: "https:",
    COAP: "coap:",
    COAPS: "coaps:",
    MQTT: "mqtt:",
    MQTTS: "mqtts:"
}

exports.PROTOCOLS = {
    HTTP: "HTTP/1.1",
    COAP: "COAP/1.0",
    MQTT: "MQTT/3.1.1",
 }

exports.EVENTS = {
    request: "request",
    response: "response",
    finish: "finish",
    disconnect: "disconnect"
 }

exports.APP =
{
    AddSignatureConversion : "app.AddSignatureConversion",
    DefaultApp : "app.DefaultApp",
    DefaultMiddleware : "app.DefaultMiddleware"
};

exports.COMMONKEYS =
{
    ClientCertificate : "ssl.ClientCertificate",
    RemoteAddress : "server.RemoteAddress",
    RemotePort : "server.RemotePort",
    LocalAddress : "server.LocalAddress",
    LocalPort : "server.LocalPort",
    IsLocalOrigin : "server.IsLocalOrigin",
    TraceOutput : "host.TraceOutput",
    Addresses : "host.Addresses",
    AppName : "host.AppName",
    Capabilities : "server.Capabilities",
    OnSendingHeaders : "server.OnSendingHeaders",
    OnAppDisposing : "host.OnAppDisposing",
    Scheme : "scheme",
    Host : "host",
    Port : "port",
    Path : "path",
    AppId: "server.AppId",
    CallCancelledSource : "server.CallCancelledSource"
};

exports.SENDFILE =
{
    Version : "sendfile.Version",
    Support : "sendfile.Support",
    Concurrency : "sendfile.Concurrency",
    SendAsync : "sendfile.SendAsync"
};

exports.OPAQUE =
{
    // 3.1. Startup
    
    Version : "opaque.Version",
    
    // 3.2. Per Request
    
    Upgrade : "opaque.Upgrade",
    
    // 5. Consumption
    
    Stream : "opaque.Stream",
    CallCancelled : "opaque.CallCancelled",
};

exports.WEBSOCKET =
{
    // 3.1. Startup
    Version : "websocket.Version",
    
    // 3.2. Per Request
    Accept : "websocket.Accept",
    
    // 4. Accept
    SubProtocol : "websocket.SubProtocol",
    
    // 5. Consumption
    SendAsync : "websocket.SendAsync",
    ReceiveAsync : "websocket.ReceiveAsync",
    CloseAsync : "websocket.CloseAsync",
    CallCancelled : "websocket.CallCancelled",
    ClientCloseStatus : "websocket.ClientCloseStatus",
    ClientCloseDescription : "websocket.ClientCloseDescription"
};

exports.SECURITY =
{
    // 3.2. Per Request
    User : "server.User",
    Authenticate : "security.Authenticate",
    
    // 3.3. Response
    SignIn : "security.SignIn",
    SignOut : "security.SignOut",
    Challenge : "security.Challenge"
};

 