/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:51:45
* @Last Modified 2016-02-20
*/

'use strict';

var ConfigurationManager = require('../../lib/ConfigurationManager')

var should = require('should')

describe("ConfigurationManager", () => {
  describe("Load", () => {
    var instance;

    it("should not be null", () => ConfigurationManager.should.not.be.null())

    it("should be instantiated", () => (instance = new ConfigurationManager()).should.not.be.null())

    it("should have defualt config", () => instance._defaultConfig.should.not.be.null())
  })
})