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

const should = require('should');

const iopa = require('../index'),
  iopaUtil = iopa.util,

  constants = iopa.constants,
  IOPA = constants.IOPA,
  SERVER = constants.SERVER,
  ACTIONS = constants.ACTIONS,
  APP = constants.APP
 
describe('#IOPA()', function () {

  var context, app, factory = new iopa.Factory({});

  it('should create empty context', function () {

    context = factory.createContext();

    (context.hasOwnProperty(IOPA.Version) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.CancelToken) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Events) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Seq) == -1).should.be.false;
    (context.hasOwnProperty(SERVER.Logger) == -1).should.be.false;
    (context.hasOwnProperty(SERVER.CancelTokenSource) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Method) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Body) == -1).should.be.false;
    (context.hasOwnProperty(IOPA.Path) == -1).should.be.false;
    (context.hasOwnProperty("IGNOREME") == -1).should.be.true;

  });

  it('should create app that updates context using both signatures', function () {

    var test = new iopa.App();
       
    // use standard IOPA signature with context
    test.use(function (context, next) {
      context[IOPA.Method] = "GET";
              
      // continue to next middleware in pipeline
      return next();
    });
            
    // use fast IOPA signature with `this` set to context
    test.use(function (next) {
      this[IOPA.Method].should.equal("GET");
      this[IOPA.Method] = "PUT";
                
      // show as complete
      return Promise.resolve("ABC");
    });

    app = test.build();

  });


  it('should call app with context updated', function (done) {

    var context = factory.createContext();

    app(context).then(function (value) {
      context[IOPA.Method].should.equal("PUT");
      context.dispose();
      (context[IOPA.Method] == null).should.be.true;
        value.should.equal("ABC");
         done();
    })
  });
  
  it('should dispose context after running an AppFunc', function (done) {

    var context = factory.createContext();

    context.using(app).then(function (value) {
          value.should.equal("ABC");
          process.nextTick(function () {
             (context[IOPA.Method] == null).should.be.true;
             done();
        });
    })
  });
  
  it('should dispose context after satisfying a promise', function (done) {

    var context = factory.createContext();

    context.using(
      (app(context).
        then(function (value) {
          context[IOPA.Method].should.equal("PUT");
          return value;
        }))
      )
      .then(function (value) {
        process.nextTick(function () {
          (context[IOPA.Method] == null).should.be.true;
          value.should.equal("ABC");
          done();
        });
      })
  });

});

describe('#CancellationTokenSource()', function () {

  var tokensource, token;

  it('should create new cancellation token', function () {

    tokensource = new iopaUtil.CancellationTokenSource();
    tokensource.isCancelled.should.equal(false);
  });

  it('should create new  token', function () {

    token = tokensource.token;
    token.isCancelled.should.equal(false);
  });
  
  it('should register a callback and cancel a token', function (done) {
    token.onCancelled(function(reason){
      reason.should.equal("EVENT REASON 126");
      process.nextTick(done);
    });
    tokensource.cancel("EVENT REASON 126");
    token.isCancelled.should.equal(true);
    tokensource.isCancelled.should.equal(true);
  });
  
});
