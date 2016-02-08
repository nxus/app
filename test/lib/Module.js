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

  describe("Use module", () => {
    var inst, other, other_app

    before((done) => {
      other_app = new TestApp()
      other = new Module(other_app, 'other')
      class TestModule {
        constructor() {
          other.use(this)
          this.respond('testEvent')
          this.respond('namedEvent', this._handler.bind(this))
        }
        _handler (a) {
          return 1
        }
        testEvent (a, b) {
          return a + b
        }
      }
      inst = new TestModule()
      other_app.emit('load');
      done()
    })
    
    it("should have method", () => {
      module.use.should.be.Function();
    })
    it("should add its methods to user", (done) => {

      inst.on.should.be.Function();
      inst.emit.should.be.Function();
      inst.provide.should.be.Function();
      inst.gather.should.be.Function();
      inst.request.should.be.Function();
      inst.respond.should.be.Function();
      done()
    })
    it("should bind to event-named methods", (done) => {
      other.request("testEvent", 1, 2).then((arg) => {
        arg.should.equal(3)
        done()
      })
    })
    it("should respond normally", (done) => {
      other.request("namedEvent").then((arg) => {
        arg.should.equal(1)
        done()
      })
    })
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
