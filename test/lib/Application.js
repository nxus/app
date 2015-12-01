/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:40:46
* @Last Modified 2015-11-23
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
    it("should bind to events", () => {
      app.on.should.not.be.null()
    })

    it("should dispatch events", (done) => {
      app.on('test').then(done)
      app.emit('test').with()
    })
  })

  describe("Boot Stages", () => {
    beforeEach(() => {
      app = new Application()
    })

    it("should send the init event", (done) => {
      app.on('init').then(done)
      app.start()
    })

    it("should send the load event", (done) => {
      app.on('load').then(done)
      app.start()
    })

    it("should send the startup event", (done) => {
      app.on('startup').then(done)
      app.start()
    })

    it("should send the launch event", (done) => {
      app.on('launch').then(done)
      app.start()
    })
  })

  describe("Event Await", () => {
    beforeEach(() => {
      app = new Application()
    })

    it("should wait until the promise has been resolved to send the next stage", (done) => {
      app.on('launch').then(done)
      var promise = new Promise((resolve, reject) => {
        setTimeout(resolve, 500);
      });
      app.await('init', promise)
      app.start()
    })
  })
})