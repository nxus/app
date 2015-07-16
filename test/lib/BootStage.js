/* 
* @Author: Mike Reich
* @Date:   2015-07-16 09:21:39
* @Last Modified 2015-07-16
*/

'use strict';

var BootStage = require('../../lib/BootStage')
var EventEmitter = require('events').EventEmitter
var app = new EventEmitter()

describe("BootStage", () => {
  describe("Load", () => {
    var instance;

    it("should not be null", () => BootStage.should.not.be.null())

    it("should be instantiated", () => new BootStage(app, 'test', [], () => {}).should.not.be.null())
  })

})