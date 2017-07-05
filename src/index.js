/* 
* @Author: mike
* @Date:   2015-05-18 16:56:47
* @Last Modified 2016-08-25
* @Last Modified time: 2016-08-25 10:03:51
*/

global.Promise = require('bluebird');

import Application from './Application'
import {application} from './Application'
import Dispatcher from './Dispatcher'
import ModuleProxy from './ModuleProxy'
import ProxyMethods from './ProxyMethods'
import ConfigurationManager from './ConfigurationManager'
import PluginManager from './PluginManager'
import NxusModule from './NxusModule'
import Logger from './Logger'
import {logger} from './Logger'

export {
  application, 
  Application, 
  Dispatcher, 
  ModuleProxy, 
  ProxyMethods, 
  ConfigurationManager, 
  PluginManager, 
  NxusModule,
  Logger,
  logger
}
