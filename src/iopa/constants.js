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

exports.VERSION = "1.4";

exports.IOPA = {
    Method: "iopa.Method",
    Path: "iopa.Path",
    Body: "iopa.Body",
    Scheme: "iopa.Scheme",
    QueryString: "iopa.QueryString",
    Protocol: "iopa.Protocol",
    Auth: "iopa.Auth",
    Host: "iopa.Host",
    Port: "iopa.Port",
    Version: "iopa.Version",
    Error: "iopa.Error",
    Seq: "iopa.Seq",
    Events: "iopa.Events",
    Headers: "iopa.Headers",
    RawBody: "iopa.RawBody",
    StatusCode: "iopa.StatusCode",

     METHODS: {
        data: "urn:io.iopa:data",
        GET: "GET",
        PUT: "PUT",
        DELETE: "DELETE",
        POST: "POST",
    },

    CAPABILITIES: {
        App: "urn:io.iopa:app",
    },
}

exports.SERVER = {
    Id: "server.Id",
    Capabilities: "server.Capabilities",
    IsBuilt: "server.IsBuilt",
    Pipeline: "server.Pipeline",
    Logger: "server.Logger",
    Factory: "server.Factory",
    CancelToken: "server.CancelToken",
    CancelTokenSource: "server.CancelTokenSource",
    AppId: "server.AppId",
    IsChild: "server.IsChild",
    ParentContext: "server.ParentContext",
    RawStream: "server.RawStream",
    RawTransport: "server.RawTransport",
    IsLocalOrigin: "server.IsLocalOrigin",
    IsRequest: "server.IsRequest"
};

exports.APPBUILDER =
    {
        DefaultApp: "app.DefaultApp",
        DefaultMiddleware: "app.DefaultMiddleware"
    };
