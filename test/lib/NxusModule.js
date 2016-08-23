/* 
* @Author: Mike Reich
* @Date:   2015-07-16 08:47:51
* @Last Modified 2016-05-20
*/

'use strict';

import {NxusModule, application} from '../../lib/'
import should from 'should'

class SubModule extends NxusModule {
  constructor(app) {
    super(app)
  }
}
SubModule.subModule = SubModule.getProxy()
console.log(SubModule.subModule)

describe("NxusModule", () => {
  describe("Load", () => {
    var instance;

    it("should not be null", () => NxusModule.should.not.be.null())

    it("should be subclassable", () => {
      instance = new SubModule(application)
      instance.should.not.be.null()
    })

    it("should set itself in app modules", () => {
      application._moduleProxies.should.have.property('subModule')
    })
    it("proxied instance should be same as app.get", (done) => {
      let app_proxy = application.get('subModule')
      console.log("app_proxy", application._moduleProxies)
      SubModule.subModule.should.equal(app_proxy)
    })
  })

})
