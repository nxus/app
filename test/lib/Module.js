'use strict';

var Module = require('../../lib/Module');
var TestApp = require('../support/TestApp');

var should = require('should')

describe("Module", () => {
  var module;
  var app = new TestApp();
  
  describe("Load", () => {
    it("should not be null", () => Module.should.not.be.null())

    it("should be instantiated", () => {
     module = new Module(app, 'test')
     module.should.not.be.null() 
    });
  });

  describe("Provide and Gather", () => {
    it("should have methods", () => {
      module.provide.should.be.Function();
      module.gather.should.be.Function();
    })
    it("should gather after load", (done) => {
      var waited = false;
      module.gather('testGather', (arg) => {
        arg.should.equal(1);
        waited = true;
        done();
      });
      module.provide('testGather', 1);
      app.on('load', () => {
        waited.should.be.false;
      })
      app.emit('load');
    })
  });

  describe("Request and Respond", () => {
    it("should have methods", () => {
      module.request.should.be.Function();
      module.respond.should.be.Function();
    })

    it("should respond to requests, with a single result", (done) => {
      module.respond('testRespond', (arg) => {
        arg.should.equal(1);
        return "one";
      });
      module.request('testRespond', 1).then((result) => {
        result.should.equal("one");
        done();
      });
    })
  });
});  
