/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:40:46
* @Last Modified 2015-07-16
*/

'use strict';

var Application = require('../../lib/Application')

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
      app.on('test', done)
      app.emit('test')
    })
  })

  describe("Boot Await", () => {
    beforeEach(() => {
      app = new Application()
    })

    it("should wait until the event has been fired to send the next stage", (done) => {
      app.on('app.startup', done)
      app.on('app.init', () => {
        app.emit('test.done')
      })
      app.await('app.init', 'test.done')
      app.start()
    })
  })

  describe("Boot Stages", () => {
    beforeEach(() => {
      app = new Application()
    })

    it("should send the init event", (done) => {
      app.on('app.init', done)
      app.start()
    })

    it("should send the load event", (done) => {
      app.on('app.load', done)
      app.start()
    })

    it("should send the startup event", (done) => {
      app.on('app.startup', done)
      app.start()
    })

    it("should send the launch event", (done) => {
      app.on('app.launch', done)
      app.start()
    })
  })
})