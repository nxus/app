import morph from 'morph'
import path from 'path'
import stackTrace from 'stack-trace'
import ModuleProxy from './ModuleProxy'
import {application} from './Application'
import Logger from './Logger'


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

    let defaultConfig = this._defaultConfig()
    if (defaultConfig !== null) {
      application.setDefaultConfig(this.__name, defaultConfig)
    }

    this._dirName = __dirName(this.constructor.name)
  }

  get config() {
    return application.config[this.__name] || {}
  }

  _defaultConfig() {
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
