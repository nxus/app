/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:40:46
* @Last Modified 2016-02-25
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

    it("should have the default config vars", () => {
      app = new Application()
      app.config.should.not.be.null()
      app.config.baseUrl.should.not.be.null()
      app.config.siteName.should.not.be.null()
    })
  })

  describe("Events", () => {
    beforeEach(() => {
      app = new Application({silent: true})
    })

    it("should bind to events", () => {
      app.on.should.not.be.null()
      app.once.should.not.be.null()
    })

    it("should dispatch events", (done) => {
      app.once('test').then(done)
      app.emit('test')
    })
    it("once is thenable", (done) => {
      app.once('test').then(done)
      app.emit('test')
    })
    it("on takes a handler", (done) => {
      app.on('test', done);
      app.emit('test')
    })
    it("once takes a handler", (done) => {
      app.once('test', done);
      app.emit('test')
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
      app.emit('test', 1)
      app.emit('test', 2)
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
    it("before > handlers > after", (done) => {
      var waited = false;
      app.before('init', () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            waited.should.be.false();
            resolve();
          }, 500);
        })
      });
      app.after('init', () => {
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
    it("before modifies args", (done) => {
      app.before('tester', (args) => {
        args[0].should.equal(1);
        return new Promise((resolve, reject) => {
          resolve([2]);
        });
      });
      app.on('tester', (i) => {
        i.should.equal(2)
        done();
      });
      app.emit('tester', 1)
      
    });
    it("after modifies results", (done) => {
      app.after('tester', (results) => {
        results.should.equal("test");
        return new Promise((resolve, reject) => {
          resolve("best");
        });
      });
      app.on('tester', (i) => {
        return "test"
      });
      app.emit('tester', 1).then((result) => {
        result.should.equal("best");
        done();
      })
    });

    it("after modifies multiple results", (done) => {
      app.after('tester', (results) => {
        results.should.equal("test");
        return new Promise((resolve, reject) => {
          resolve("best");
        });
      });
      app.after('tester', (results) => {
        results.should.equal("best");
        return new Promise((resolve, reject) => {
          resolve(["best", "nest"]);
        });
      });
      app.on('tester', (i) => {
        return "test"
      });
      app.emit('tester', 1).then(([result1, result2]) => {
        result1.should.equal("best");
        result2.should.equal("nest");
        done();
      })
    });
  })

  describe("Boot Stages", () => {
    beforeEach(() => {
      app = new Application({silent: true})
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
      app.get('something').provide.should.be.Function()
      done();
    });
  });
})
