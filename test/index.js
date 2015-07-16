/* 
* @Author: Mike Reich
* @Date:   2015-07-16 07:52:33
* @Last Modified 2015-07-16
*/

'use strict';

var should = require('should')

var runTests = () => {
  require('./lib/ConfigurationManager')
  require('./lib/PluginManager')
  require('./lib/BootStage')
  require('./lib/StorageManager')
  require('./lib/Application')
}

runTests()