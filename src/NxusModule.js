import morph from 'morph'
import path from 'path'
import stackTrace from 'stack-trace'
import ModuleProxy from './ModuleProxy'
import {application} from './Application'
import Logger from './Logger'
import deepExtend from 'deep-extend'


function __dirName(constructorName) {
  for (let site of stackTrace.get()) {
    if(site.getFunctionName() == constructorName) {
      return path.dirname(site.getFileName())
    }
  }
}

/**
 * The NxusModule class is a base class for all Nxus modules.
 *
 * @property {object} config The application configuration for this module.
 * @property {Logger} log The logger for the module.
 */
class NxusModule {

  constructor(app) {
    this.__name = this.constructor._moduleName()
    application.get(this.__name).use(this)

    this.log = Logger(this.__name)

    let userConfig = this._userConfig()
    if (userConfig !== null) {
      application.setUserConfig(this.__name, userConfig)
    }

    this._dirName = __dirName(this.constructor.name)
  }

  get config() {
    let _defaultConfig = this._defaultConfig() || {}
    if(!this._config) this._config = Object.assign({}, deepExtend(_defaultConfig, application.config[this.__name]))
    return this._config
  }

  set config(val) {
    this._config = val
  }

  _defaultConfig() {
    return null
  }

  _userConfig() {
    return null
  }

  static _moduleName() {
    return morph.toDashed(this.name)
  }

  static getProxy() {
    return application.get(this._moduleName())
  }

}

export default NxusModule
