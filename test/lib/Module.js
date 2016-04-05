'use strict';

var Module = require('../../lib/Module');
var TestApp = require('../support/TestApp');

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
          this.x = 1
          other.use(this)
          this.respond('testEvent')
          this.respond('namedEvent', this._handler.bind(this))
        }
        _handler (a) {
          return 1
        }
        testEvent (a, b) {
          return this.x + a + b
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
      inst.default.should.be.Function();
      inst.replace.should.be.Function();
      inst.gather.should.be.Function();
      inst.request.should.be.Function();
      inst.respond.should.be.Function();
      done()
    })
    it("should bind to event-named methods", (done) => {
      other.request("testEvent", 1, 2).then((arg) => {
        arg.should.equal(4)
        done()
      })
    })
    it("should respond normally", (done) => {
      other.request("namedEvent").then((arg) => {
        arg.should.equal(1)
        done()
      })
    })
    it("should respond normally to proxy method", (done) => {
      other.namedEvent().then((arg) => {
        arg.should.equal(1)
        done()
      })
    })
    it("should error for missing event handlers", (done) => {
      expect(inst.respond, 'missingHandler').to.throw();
      done();
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
    it("should gather with a single result", (done) => {
      module.gather('testGather2', (arg) => {
        arg.should.equal(1);
        return "one";
      });
      module.provide('testGather2', 1).then((result) => {
        result.should.equal("one");
        done();
      });
    })
    it("should return proxy for argument-less", (done) => {
      module.gather('testGather3', (arg) => {
        arg.should.equal(1);
        return "one";
      });
      module.provide().testGather3(1).then((result) => {
        result.should.equal("one");
        done()
      });
    })
  });

  describe("Default and Replace", () => {
    before(() => {
      module = new Module(app, 'test')
    })
    it("should have methods", () => {
      module.original.should.be.Function();
      module.replace.should.be.Function();
    })
    it("should gather after load", (done) => {
      var waited = false;
      var original = false;
      module.gather('testDefault', (arg) => {
        if (arg == 1) {
          waited.should.be.false
          original = arg
        } else {
          original.should.equal(1)
          waited = true;
          done();
        }
      });
      module.replace('testDefault', 2)
      module.default('testDefault', 1)
      app.on('load', () => {
        waited.should.be.false;
      })
      app.emit('load');
    })
    it("should return proxy for argument-less", (done) => {
      module.gather('testDefault2', (arg) => {
        arg.should.equal(1);
        return "one";
      });
      module.default().testDefault2(1).then((result) => {
        result.should.equal("one");
      });
      module.replace().testDefault2(1).then((result) => {
        result.should.equal("one");
        done()
      });
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
  describe("Proxy to provide", () => {
    it("should support events as method names", (done) => {
      module.testMethod(1).then((result) => {
        result.should.equal("one");
        done();
      });
      module.respond('testMethod', (arg) => {
        arg.should.equal(1);
        return "one";
      });
    })
  });

  describe("Warns for unregistered events", () => {
    let m, a
    before((done) => {
      a = new TestApp()
      m = new Module(a, 'test')
      done()
    })
    it("warns after launch", (done) => {
      m.respond('someSuchEvent', () => {})
      m.request('noSuchEvent', 1)
      a.launch().then(() => {
        a.log.warn.called.should.be.true()
        a.log.warn.calledWith('Module', 'test', 'called with events:', 'noSuchEvent').should.be.true()
        done()
      })
    })
  })

});  
