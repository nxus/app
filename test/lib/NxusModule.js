/* 
* @Author: Mike Reich
* @Date:   2015-07-16 08:47:51
* @Last Modified 2016-08-25
*/

'use strict';

import {NxusModule, application} from '../../lib/'
import should from 'should'

class SubModule extends NxusModule {
  constructor(app) {
    super(app)
  }

  defaultConfig() {
    return {"other": "you"}
  }
}
SubModule.subModule = SubModule.getProxy()

describe("NxusModule", () => {
  var instance;

  beforeEach(() => {
    instance = new SubModule(application)
  })

  describe("Load", () => {
    it("should not be null", () => NxusModule.should.not.be.null())

    it("should be subclassable", () => {
      instance.should.not.be.null()
    })

    it("should set itself in app modules with the config name (dashed)", () => {
      application._modules.should.have.property('sub-module')
    })

    it("should set defaultConfig", () => {
      application.config.should.have.property("sub-module")
      application.config['sub-module'].should.have.property("other", "you")
    })

    it("should get config from app key", () => {
      application.config['sub-module']["hi"] = "hello"
      instance.config.hi.should.equal("hello")
    })
  })

  describe("Logging", () => {
    it("should have a logger instance", () => {
      instance.log.should.not.be.null()
    })
  })

})
