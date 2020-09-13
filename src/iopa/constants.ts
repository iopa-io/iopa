/*
 * Internet Open Protocol Abstraction (IOPA)
 * Copyright (c) 2016-2020 Internet Open Protocol Alliance
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

export const VERSION = '3.0'

export const IOPA = Object.freeze({
    // V3 Request / Response
    Headers: 'iopa.Headers',
    Method: 'iopa.Method',
    OriginalUrl: 'iopa.OriginalUrl',
    URL: 'iopa.Url',
    Path: 'iopa.Path',
    Protocol: 'iopa.Protocol',
    QueryString: 'iopa.QueryString',
    Scheme: 'iopa.Scheme',
    Body: 'iopa.Body',
    RemoteAddress: 'iopa.RemoteAddress',
    StatusCode: 'iopa.StatusCode',
    StatusText: 'iopa.StatusText',

    Events: 'iopa.Events',
    Version: 'iopa.Version',
    Error: 'iopa.Error',
    Seq: 'server.Id',

    // V1.4 request response constanst (deprecated)

    Auth: 'iopa.Auth',
    Host: 'iopa.Host',
    Port: 'iopa.Port',
    RawBody: 'iopa.RawBody',

    METHODS: {
        data: 'urn:io.iopa:data',
        GET: 'GET',
        PUT: 'PUT',
        DELETE: 'DELETE',
        POST: 'POST',
    },

    CAPABILITIES: {
        App: 'urn:io.iopa:app',
    },
})

export const SERVER = Object.freeze({
    Id: 'server.Id',
    Capabilities: 'server.Capabilities',
    IsBuilt: 'server.IsBuilt',
    Pipeline: 'server.Pipeline',
    Factory: 'server.Factory',
    CancelToken: 'server.CancelToken',
    CancelTokenSource: 'server.CancelTokenSource',
    AppId: 'server.AppId',
    AppType: 'server.AppType',
    AppDescription: 'server.AppDescription',
    IsChild: 'server.IsChild',
    ParentContext: 'server.ParentContext',
    RawStream: 'server.RawStream',
    RawTransport: 'server.RawTransport',
    IsLocalOrigin: 'server.IsLocalOrigin',
    IsRequest: 'server.IsRequest',
    Events: 'server.Events',
    Version: 'server.Version',
})

export const APPBUILDER = Object.freeze({
    DefaultApp: 'app.DefaultApp',
    DefaultMiddleware: 'app.DefaultMiddleware',
})
