/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:51:45
* @Last Modified 2016-03-05
*/

'use strict';

var ConfigurationManager = require('../../lib/ConfigurationManager')

var should = require('should')

describe("ConfigurationManager", () => {
  var instance
  
  describe("Load", () => {

    it("should not be null", () => ConfigurationManager.should.not.be.null())

    it("should be instantiated", () => (instance = new ConfigurationManager()).should.not.be.null())
  })

  describe("Node Env", () => {
    it("uses NODE_ENV", (done) => {
      instance = new ConfigurationManager()
      process.NODE_ENV = 'test'
      instance.getNodeEnv().should.equal('test')
      done()
    })
    it("prefers passed in env", (done) => {
      instance = new ConfigurationManager({env: "production"})
      process.NODE_ENV = 'test'
      instance.getNodeEnv().should.equal('production')
      done()
    })
  })
  
  describe("Package Config", () => {
    before((done) => {
      instance = new ConfigurationManager({appDir: __dirname+"/testApp", env: 'test'})
      done()
    })
    it("should read package.json config", (done) => {
      let config = instance.getConfig()
      config.should.have.property('siteName', 'test-nxus-app')
      config.should.have.property('customConfig', 'default')
      done()
    })
    it("should merge environment config", (done) => {
      instance.opts.env = 'dev'
      let config = instance.getConfig()
      config.should.have.property('customConfig', 'dev-default')
      done()
    })
  })
})
