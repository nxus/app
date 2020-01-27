/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:51:45
* @Last Modified 2016-05-20
*/

'use strict';

import {ConfigurationManager} from '../../lib'
import should from 'should'

describe("ConfigurationManager", () => {
  var instance
  
  describe("Load", () => {

    it("should not be null", () => ConfigurationManager.should.not.be.null())

    it("should be instantiated", () => (instance = new ConfigurationManager({namespace: 'nxus'})).should.not.be.null())
  })

  describe("Node Env", () => {
    it("uses NODE_ENV", (done) => {
      instance = new ConfigurationManager({namespace: 'nxus'})
      process.NODE_ENV = 'test'
      instance.getNodeEnv().should.equal('test')
      done()
    })
    it("prefers passed in env", (done) => {
      instance = new ConfigurationManager({env: "production", namespace: 'nxus'})
      process.NODE_ENV = 'test'
      instance.getNodeEnv().should.equal('production')
      done()
    })
  })

  describe("Package Config as JSON5", () => {
    before((done) => {
      instance = new ConfigurationManager({config: __dirname+"/../testApp5/.nxusrc", env: 'test', namespace: 'nxus'})
      done()
    })
    it("should read rc config", (done) => {
      let config = instance.getConfig()
      config.should.have.property('siteName', 'test-nxus-app-json5')
      config.should.have.property('customConfig', 'default')
      done()
    })
  })
  
  describe("Package Config", () => {
    before((done) => {
      instance = new ConfigurationManager({config: __dirname+"/../testApp/.nxusrc", env: 'test', namespace: 'nxus'})
      done()
    })
    it("should read rc config", (done) => {
      let config = instance.getConfig()
      config.should.have.property('siteName', 'test-nxus-app')
      config.should.have.property('customConfig', 'default')
      done()
    })
    it("should read commandline config", (done) => {
      let config = instance.getConfig()
      config.should.have.property('myconfig', 'test')
      done()
    })
  })
})
