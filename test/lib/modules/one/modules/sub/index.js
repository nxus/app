import {NxusModule} from '../../../../../../lib'

import NestedController from './controllers/nested'

class NestedSub extends NxusModule {
  constructor() {
    super()
    this.controller = new NestedController()
  }
  
}

let nestedSub = NestedSub.getProxy()
export {NestedSub as default, nestedSub}
