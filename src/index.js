/* 
* @Author: mike
* @Date:   2015-05-18 16:56:47
* @Last Modified 2016-02-20
* @Last Modified time: 2016-02-20 15:37:07
*/

require('babel-runtime/core-js/promise').default = require('bluebird');

module.exports = {
  Application: require('./Application'),
  Dispatcher: require('./Dispatcher'),
  Module: require('./Module'),
  ProxyMethods: require('./ProxyMethods'),
  ConfigurationManager: require('./ConfigurationManager'),
  PluginManager: require('./PluginManager')
};
