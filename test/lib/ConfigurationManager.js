/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:51:45
* @Last Modified 2015-07-16
*/

'use strict';

var ConfigurationManager = require('../../lib/ConfigurationManager')

describe("ConfigurationManager", () => {
  describe("Load", () => {
    var instance;

    it("should not be null", () => ConfigurationManager.should.not.be.null())

    it("should be instantiated", () => (instance = new ConfigurationManager()).should.not.be.null())
  })

  describe("Load with opts", () => {
    var instance;

    it("should use the passed in appDir if present", () => {
      instance = new ConfigurationManager({appDir: 'someValue'})
      instance.appDir.should.eql('someValue')
    })
  })
})