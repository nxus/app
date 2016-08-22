/* 
* @Author: Mike Reich
* @Date:   2015-07-16 08:47:51
* @Last Modified 2016-05-20
*/

'use strict';

import {NxusModule, Application} from '../../lib/'
import should from 'should'

class SubModule extends NxusModule {
  constructor(app) {
    super(app)
  }
}


describe("NxusModule", () => {
  describe("Load", () => {
    var instance;
    var app = new Application();

    it("should not be null", () => NxusModule.should.not.be.null())

    it("should be subclassable", () => {
      instance = new SubModule(app)
      instance.should.not.be.null()
    })

    it("should set itself as instance at lower name", () => {
      SubModule.subModule.should.not.be.null()
    })
  })

})
