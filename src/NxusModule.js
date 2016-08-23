import ModuleProxy from './ModuleProxy'
import {application} from './Application'

class NxusModule {

  constructor(app) {
    app.get(this.constructor._moduleName()).use(this)
  }

  static _moduleName() {
    let n = this.name
    return n[0].toLowerCase() + n.substring(1)
  }

  static getProxy() {
    return application.get(this._moduleName())
  }

}

export default NxusModule
