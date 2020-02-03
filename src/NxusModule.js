import morph from 'morph'
import path from 'path'
import fs from 'fs'
import stackTrace from 'stack-trace'
import ModuleProxy from './ModuleProxy'
import {application} from './Application'
import Logger from './Logger'
import deepExtend from 'deep-extend'

function _filenameOf(construct) {
  for (let [k,v] of Object.entries(require.cache)) {
    let exports = v.exports.default ? v.exports : {default: v.exports}
    for (let [,ex] of Object.entries(exports)) {
      if (ex == construct) {
        return v.filename
      }
    }
  }
  for (let site of stackTrace.get()) {
    if(site.getFunctionName() == construct.name) {
      return site.getFileName()
    }
  }
}

const EXCLUDE_DIRNAMES = ['src', 'lib', 'test', 'modules']

function _modulePrefix(filename) {
  let dirname = path.dirname(filename)
  let dirs = dirname.split(path.sep)
  let result = []
  let root
  while (!root && dirs.length) {
    let testFile = dirs.concat(['package.json']).join(path.sep)
    if (fs.existsSync(testFile)) {
      root = true
    } else {
      let p = dirs.pop()
      if (!EXCLUDE_DIRNAMES.includes(p)) {
        result.unshift(p)
      }
    }
  }
  return result.join('/')
}

/**
 * The NxusModule class is a base class for all Nxus modules.
 *
 * @property {object} config The application configuration for this module.
 * @property {Logger} log The logger for the module.
 */
class NxusModule {

  constructor(app) {
    this._dirName = path.dirname(_filenameOf(this.constructor))
    this.__name = this.constructor._moduleName()
    this.__config_name = this.constructor._configName(this.__name)
    this.log = Logger(this.__name)

    let userConfig = this._userConfig()
    if (userConfig !== null) {
      application.setUserConfig(this.__config_name, userConfig)
    }

    this.__proxy = application.get(this.__name)
    this.__proxy.use(this)
  }

  get config() {
    let _defaultConfig = this._defaultConfig() || {}
    if (!this._config) {
      this._config = Object.assign(
        {},
        deepExtend(_defaultConfig, application.config[this.__config_name])
      )
    }
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

  static __appRef() {
    return application
  }

  static _configName(name) {
    return morph.toSnake(name)
  }

  static _moduleName(filename) {
    if (filename === undefined) {
      filename = _filenameOf(this)
    }
    let useMyName = path.basename(filename) != 'index.js'
    let name = _modulePrefix(filename)
    // this logic of ignoring class name for modules
    // is in part to match src/PluginManager:_loadModulesFromDirectory
    if (useMyName) {
      name = name ? name + "/" + this.name : this.name
    }
    return morph.toDashed(name)
  }

  static getProxy() {
    // force to caller file, assuming getProxy is called in same file as class definition
    return application.get(this._moduleName(stackTrace.get()[1].getFileName()))
  }

  deregister() {
    this.__proxy.deregister()
  }

}

export default NxusModule
