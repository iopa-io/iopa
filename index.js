/*
 * Copyright 2015 Limerun Project Contributors
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
 
exports.promise = require ( 'bluebird' ) ;
exports.App = require ( './lib/appBuilder.js' ) ;
exports.app = exports.App;
exports.context = {
	factory: require ( './lib/iopa/contextFactory.js' ),
    expand: require('./lib/iopa/iopaExpand.js' ),
}
exports.constants = require ( './lib/util/constants.js' ) ;
exports.shallow = require ( './lib/util/shallow.js' ) ;

exports.connect = require ( './lib/iopa/iopaConnect.js' ) ;
exports.http = require ( './lib/iopa/iopaHTTP.js' ) ;

exports.app.prototype.buildHttp = function ( opts ) {
	 return exports.http ( this.build ( opts ) ) ;  
 };
