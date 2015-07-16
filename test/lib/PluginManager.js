/* 
* @Author: Mike Reich
* @Date:   2015-07-16 08:47:51
* @Last Modified 2015-07-16 @Last Modified time: 2015-07-16 08:47:51
*/

'use strict';

var PluginManager = require('../../lib/PluginManager')

describe("PluginManager", () => {
  describe("Load", () => {
    var instance;

    it("should not be null", () => PluginManager.should.not.be.null())

    it("should be instantiated", () => (instance = new PluginManager()).should.not.be.null())
  })

})