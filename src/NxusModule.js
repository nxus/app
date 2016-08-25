import morph from 'morph'
import ModuleProxy from './ModuleProxy'
import {application} from './Application'

class NxusModule {

  constructor(app) {
    this.__name = this.constructor._moduleName()

    application.get(this.__name).use(this)

    let defaultConfig = this.defaultConfig()
    if (defaultConfig !== null) {
      application.writeDefaultConfig(this.__name, defaultConfig)
    }
  }

  get config() {
    return application.config[this.__name]
  }

  defaultConfig() {
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
