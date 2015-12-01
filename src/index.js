/* 
* @Author: mike
* @Date:   2015-05-18 16:56:47
* @Last Modified 2015-11-24
* @Last Modified time: 2015-11-24 08:52:15
*/

require('babel-runtime/core-js/promise').default = require('bluebird');

module.exports = {
  Application: require('./Application'),
  Dispatcher: require('./Dispatcher'),
  ConfigurationManager: require('./ConfigurationManager'),
  PluginManager: require('./PluginManager')
};