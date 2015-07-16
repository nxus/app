/* 
* @Author: Mike Reich
* @Date:   2015-07-16 09:24:48
* @Last Modified 2015-07-16 @Last Modified time: 2015-07-16 09:24:48
*/

'use strict';

var StorageManager = require('../../lib/StorageManager')

describe("StorageManager", () => {
  describe("Load", () => {
    var instance;

    it("should not be null", () => StorageManager.should.not.be.null())

    it("should be instantiated", () => (instance = new StorageManager()).should.not.be.null())
  })

})