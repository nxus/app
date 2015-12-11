/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:40:46
* @Last Modified 2015-12-08
*/

'use strict';

var Application = require('../../lib/').Application

var Promise = require('bluebird')

var should = require('should')

describe("Application", () => {
  var app;
  describe("Load", () => {
    it("should not be null", () => Application.should.not.be.null())

    it("should be instantiated", () => (app = new Application()).should.not.be.null())

    it("should use the passed in appDir if present", () => {
      app = new Application({appDir: 'someValue'})
      app.config.appDir.should.eql('someValue')
    })
  })

  describe("Events", () => {
    beforeEach(() => {
      app = new Application()
    })

    it("should bind to events", () => {
      app.on.should.not.be.null()
      app.once.should.not.be.null()
    })

    it("should dispatch events", (done) => {
      app.once('test').then(done)
      app.emit('test').with()
    })
    it("once is thenable", (done) => {
      app.once('test').then(done)
      app.emit('test').with()
    })
    it("on takes a handler", (done) => {
      app.on('test', done);
      app.emit('test').with()
    })
    it("once takes a handler", (done) => {
      app.once('test', done);
      app.emit('test').with()
    })
    it("should dispatch events multiple times", (done) => {
      var count = 0;
      app.on('test', function(arg) {
        count++;
        if(count == 1) {
          arg.should.equal(1)
        }
        if(count >= 2) {
          arg.should.equal(2)
          done()
        }
      })
      app.emit('test').with(1);
      app.emit('test').with(2);
    })
    it("once should wait for events that return a promise", (done) => {
      var waited = false;
      app.once('launch').then(() => {
        waited.should.be.true();
        done();
      });
      var promise = new Promise((resolve, reject) => {
        setTimeout(() => { waited = true; resolve(); }, 500);
      });
      app.once('init', () => { return promise });
      app.start();
      
    });
    it("on should wait for events that return a promise", (done) => {
      var waited = false;
      app.once('launch').then(() => {
        waited.should.be.true();
        done();
      });
      var promise = new Promise((resolve, reject) => {
        setTimeout(() => { waited = true; resolve(); }, 500);
      });
      app.on('init', () => { return promise });
      app.start();
      
    });
    it("on: before > handlers > after", (done) => {
      var waited = false;
      app.on('init.before', () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            waited.should.be.false();
            resolve();
          }, 500);
        })
      });
      app.on('init.after', () => {
        waited.should.be.true();
        done();
      });

      app.on('init', () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => { waited = true; resolve(); }, 200);
        });
      });
      app.start();
      
    });
    it("on: before modifies args", (done) => {
      app.on('tester.before', (args) => {
        args[0].should.equal(1);
        return new Promise((resolve, reject) => {
          resolve([2]);
        });
      });
      app.on('tester', (i) => {
        i.should.equal(2)
        done();
      });
      app.emit('tester').with(1)
      
    });
    it("on: after modifies results", (done) => {
      app.on('tester.after', (results) => {
        results[0].should.equal("test");
        return new Promise((resolve, reject) => {
          resolve(["best"]);
        });
      });
      app.on('tester', (i) => {
        return "test"
      });
      app.emit('tester').with(1).then(([result]) => {
        result.should.equal("best");
        done();
      })
      
    });
  })

  describe("Boot Stages", () => {
    beforeEach(() => {
      app = new Application()
    })

    it("should send the init event", (done) => {
      app.once('init').then(done)
      app.start()
    })

    it("should send the load event", (done) => {
      app.once('load').then(done)
      app.start()
    })

    it("should send the startup event", (done) => {
      app.once('startup').then(done)
      app.start()
    })

    it("should send the launch event", (done) => {
      app.once('launch').then(done)
      app.start()
    })
  })

  describe("Get Module", () => {
    beforeEach(() => {
      app = new Application()
    })

    it("should return a Module", (done) => {
      app.get('something').on.should.be.Function()
      app.get('something').gather.should.be.Function()
      app.get('something').send.should.be.Function()
      done();
    });
  });
})
