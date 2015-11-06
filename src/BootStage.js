/* 
* @Author: mike
* @Date:   2015-05-18 17:03:51
* @Last Modified 2015-11-05
* @Last Modified time: 2015-11-05 18:54:53
*/

'use strict';

import _ from 'underscore'

class BootStage {

  constructor(app, name, await, next) {
    this.app = app
    this.name = name
    this.await = await
    this.next = next

    this.await.forEach((a) => {
      this.app.on(a,
        (() => {
          return () => {
            this.await = _.without(this.await, a)
            this.check()
          }
        })()
      )
    })
  }

  execute() {
    this.app.emit(this.name)
    this.check()
  }

  check() {
    if (this.next && this.await.length === 0) this.next()
  }
}

export default BootStage