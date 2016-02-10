/* 
* @Author: Mike Reich
* @Date:   2015-05-23 09:36:21
* @Last Modified 2016-02-09
*/

import moment from 'moment'

/**
 * The Watcher class monitors the project directory and restarts the application whenever 
 * there is a change in files detected. Useful for development.
 */

export default class Watcher {
  constructor(app, watchPath, watchEvent, ignore) {
    var chokidar = require('chokidar')
    
    var parsePluginNameFromChangePath = (path) => {
      var pathPortions = path.split('/')
      return pathPortions[pathPortions.indexOf('@nxus') + 1]
    }
    
    var watchOptions = {
      ignored: ignore ? ignore.concat([new RegExp("^(.*node_modules/(?!@nxus).*)")]) : new RegExp("^(.*node_modules/(?!@nxus).*)"),
      ignoreInitial: true,
      persistent: true
    }

    var watch = watchPath || process.cwd() + '/node_modules/@nxus'
    
    this.watch = chokidar.watch(watch,watchOptions)
    this.watch.on('all', (event, path) => {
        console.log(watchEvent, path) 
        app.emit(watchEvent || 'change.detected', path)
      }
    ) 

    app.on('change', (path) => {
      this.watch.close();
      var start = moment()
      if(app._currentStage != app._bootEvents[app._bootEvents.length - 1]) return
      app.restart().then(() => {
        var end = moment()
        console.log(`Restart took ${end.diff(start, 'seconds')} seconds`)
        app.emit('app.run.tests', path)
      })
    })
  }
  
  close() {
    this.watch.close()
  }
}

