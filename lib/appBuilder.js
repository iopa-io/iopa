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

/*
 * Module dependencies.
 */
var Middleware = require('./middleware.js');
var Mount = require('./iopa/iopaMount.js');
var Images = require('./util/images.js');
var constants = require('./util/constants.js');
var guidFactory = require('./util/guid.js');

var Promise = require('bluebird');

function AppBuilder() {
    this.properties = {};
    this.properties["server.AppId"] = guidFactory.guid();
    this.properties["server.Capabilities"] = {};

    this.middleware = [];
    this.properties[constants.app.DefaultApp] = DefaultApp;
    this.properties[constants.app.DefaultMiddleware] = [RespondMiddleware];
}

exports = module.exports = AppBuilder;

var app = AppBuilder.prototype;

app.use = function(mw){
        this.middleware.push(Middleware(this, mw));
        return this;
    };

app.mount = function (location, appletFunc) {
    var appFunc, appBuilderChild, mounted;
    appBuilderChild = new AppBuilder();
    appletFunc(appBuilderChild);
    appFunc = appBuilderChild.build();
    mounted = Mount(location, appFunc);
    this.middleware.push(mounted);
    return this;
};

/***
 * AppBuilder Function to Compile/Build all Middleware in the Pipeline into single IOPA AppFunc
 *
  *@return {function(context)} IOPA application 
 * @public
 */
app.build = function(){
    var mw = this.properties[constants.app.DefaultMiddleware].concat(this.middleware).concat(this.properties[constants.app.DefaultApp]);
    return pipeline(mw);
};

function pipeline(middleware){
     return function appbuilder_pipeline(context){
       try {
            var i, prev, curr;
            i = middleware.length;
            prev = function (){return Promise.resolve(null);};
            while (i--) {
                curr = middleware[i];
                prev = curr.bind(global, context, prev);
            }
            return prev();
        }
        catch (err)
        {
            DefaultError(context,err);
            context = null;
            return Promise.resolve(null);
        } 
    };
}

// DEFAULT HANDLERS:  RESPOND, DEFAULT APP, ERROR HELPER

function RespondMiddleware(context, next){
    return next().then(
                       function (ret){
                        return ret;
                    },
                       function (err){
                        DefaultError(context,err);
                        return Promise.resolve(null);
                    });
}

function DefaultApp(context, next){
    if (context["server.Error"])
    {
        return Promise.reject(context["server.Error"]);
    }
    else
    {
        return Promise.resolve(null);
    }
}

function DefaultError(context, err){
    if (context["iopa.Protocol"] == "HTTP/1.1")
    {
            DefaultErrorHttp(context, err);
    }
    else
    {
        console.log("Server/Middleware Error: " + err);
        throw(err);
    }
}

function DefaultErrorHttp(context, err){
    console.log(err);
  if (err===404)
    {
        context.response.writeHead(404, {'Content-Type': 'text/html'});
        context.response.write(Images.logo);
        context.response.end('<h1>404 Not Found</h1><p>Could not find resource:</p><xmb>' + this.request.path + '</xmb>');
    }
    else
    {
        context.response.writeHead(500, {'Content-Type': 'text/html'});
        context.response.write(Images.logo);
        context.response.end('<h1>500 Server Error</h1><p>An error has occurred:</p><xmb>' + err + '</xmb> ');
    } 
}
