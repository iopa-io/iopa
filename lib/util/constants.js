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

exports.iopa = {
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
    Id: "iopa.Id",
};

exports.app =
{
    AddSignatureConversion : "app.AddSignatureConversion",
    DefaultApp : "app.DefaultApp",
    DefaultMiddleware : "app.DefaultMiddleware"
};

exports.commonkeys =
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

exports.sendfile =
{
    Version : "sendfile.Version",
    Support : "sendfile.Support",
    Concurrency : "sendfile.Concurrency",
    SendAsync : "sendfile.SendAsync"
};

exports.opaque =
{
    // 3.1. Startup
    
    Version : "opaque.Version",
    
    // 3.2. Per Request
    
    Upgrade : "opaque.Upgrade",
    
    // 5. Consumption
    
    Stream : "opaque.Stream",
    CallCancelled : "opaque.CallCancelled",
};

exports.websocket =
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


exports.security =
{
    // 3.2. Per Request
    User : "server.User",
    Authenticate : "security.Authenticate",
    
    // 3.3. Response
    SignIn : "security.SignIn",
    SignOut : "security.SignOut",
    Challenge : "security.Challenge"
};


