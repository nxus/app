/* 
* @Author: mike
* @Date:   2015-05-18 17:06:08
* @Last Modified 2015-07-16
* @Last Modified time: 2015-07-16 09:26:25
*/

'use strict';

class StorageManager {

  constructor(app) {
    if(!app) return

    if(app.config && (typeof app.config.awaitStorage == 'undefined' || app.config.awaitStorage)) 
      app.await('app.init', 'storage.ready')

    app.on('app.init', () => {
      app.emit('storage.set', this, app)
    })
  }
}

module.exports = StorageManager
