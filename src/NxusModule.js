import morph from 'morph'
import ModuleProxy from './ModuleProxy'
import {application} from './Application'
import Logger from './Logger'

class NxusModule {

  constructor(app) {
    application.get(this.constructor._moduleName()).use(this)
    this.log = Logger(this.constructor._moduleName())
  }

  static _moduleName() {
    return morph.toDashed(this.name)
  }

  static getProxy() {
    return application.get(this._moduleName())
  }

}

export default NxusModule
