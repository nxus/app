/* 
* @Author: mike
* @Date:   2015-05-18 17:06:08
* @Last Modified 2015-11-05
* @Last Modified time: 2015-11-05 18:55:45
*/

'use strict';

class StorageManager {

  constructor(app) {
    if(!app) return

    app.on('app.init', () => {
      app.emit('storage.set', this, app)
    })
  }
}

export default StorageManager
