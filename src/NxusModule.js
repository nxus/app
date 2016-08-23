
class NxusModule {

  constructor(app) {
    let myName = this.name()
    app.get(myName).use(this)
    this.constructor[myName] = this
  }

  name() {
    let n = this.constructor.name
    return n[0].toLowerCase() + n.substring(1)
  }

  static getProxy(app) {
    
  }

}

export default NxusModule
