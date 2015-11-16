/* 
* @Author: mike
* @Date:   2015-05-18 17:03:15
* @Last Modified 2015-11-16
* @Last Modified time: 2015-11-16 14:01:29
*/

import _ from 'underscore'
import util from 'util'
import fs from 'fs'
import async from 'async'
import domain from 'domain'
import path from 'path'

import Dispatcher from './Dispatcher'
import PluginManager from './PluginManager'
import BootStage from './BootStage'
import ConfigurationManager from './ConfigurationManager'
import StorageManager from './StorageManager'
import Watcher from './Watcher'

var logBanner = (message) => {
  console.log(' --- ')
  console.log(' --- '+ message)
}

var pluginDir = './storage/config'
var pluginConfig = pluginDir + '/plugins.json'

class Application extends Dispatcher {
  
  constructor(options = {}) {
    super()
    this._availablePlugins = []
    this._plugins = {}
    this._pluginInfo = {}
    this.loaded = 0
    this._loadComplete = false
    this._bootAwait = {
      'app.init': [],
      'app.load': [],
      'app.startup': [],
      'app.launch': []
    }
    
    this._bootEvents = [
      'app.init',
      'app.load',
      'app.startup',
      'app.launch'
    ]

    options.appDir = options.appDir || path.dirname(require.main.filename)

    this.config = _.extend(options, new ConfigurationManager(options).getConfig())
    if(typeof this.config.debug === 'undefined') this.config.debug = (!process.env.NODE_ENV || process.env.NODE_ENV == 'development')
    
    this.setMaxListeners(100000) // supress node v0.11+ warning

    this.log = (...args) => {
      if(this.config.debug) console.log.apply(this, args)
    }

    this.log = _.extend(this.log, console, {
      debug: (...args) => {
        if(this.config.debug) console.log.apply(this, args)
      }, 
      info: (...args) => {
        if(this.config.debug) console.log.apply(this, args)
      } 
    })

    this.domain = domain.create()
    
    this.domain.on('error', (err) => {
      console.log('Uncaught global error', err.toString(), err.stack, err)
      if (this.log && this.log.error) {
        this.log.error('Uncaught global error', err.toString(), err.stack, err)
      }
      if (this.restart) {
        this.restart()
      }
    })
  }

  /*
   * Application control methods
   */

  init(cb) {
    this._initializeDataStorage()
    this._initializeEventListeners()
    this._loadPlugins()
    
    if (!this.config.script && this.config.NODE_ENV != 'production') {
      this.appWatcher = new Watcher(this, this._getWatchPaths(), 'change.app', this._getAppIgnorePaths())
    }

    this.boot(cb)
  }

  boot(cb) {
    if (this.config.debug) logBanner('Booting Application')
    async.eachSeries(
      this._bootEvents,
      (e, callback) => {
        if (this.config.debug) logBanner("Stage: "+e)
        var stage = new BootStage(this, e, this._bootAwait[e], callback)
        stage.execute()
      }, (error) => {
        if(error) {
          logBanner('Error booting:', error)
          process.exit()
        } else {
          if (cb) cb()
        }
      }
    )
  }

  await(stage, event) {
    this._bootAwait[stage].push(event)
  }

  stop() {
    if (this.config.debug) logBanner('Stopping')
    this.emit("app.stop")
    this._events.forEach((event) => {
      this.removeAllListeners(event)
    })
  }

  start() {
    this.log('*** NXUS APP Started at ' + new Date() + ' ***')
    this.domain.run(() => {
      this.init()   
    })
  }

  restart(cb) {
    console.log()
    this._invalidatePluginsInRequireCache()
    this.stop()
    this.init(cb)
  }

  /*
   * Internal methods
   */
  
  _loadPlugins() {
    if (this.config.debug) {
      logBanner('Loading plugins')
    }

    this._getPlugins()
    this._bootPlugins((err) => {
      if (err) {
        console.log('Error loading plugins:', err)
        process.exit()
      }
    })
  }

  /*

   This function is called on restart to invalidate the require cache so
   plugins are loaded freshly on restart- it does expect that plugins that
   need to have responded to the 'app.stop' event e.g. Mongoose closes
   its connections

   Allows plugins to be reloaded from disk at runtime

   */
  _invalidatePluginsInRequireCache() {
    // we only want to reload nxus code
    var ignore = new RegExp("^(.*node_modules/(?!@nxus).*)")
    // but we need to always reload mongoose so that models can be rebuilt
    var mongoose = new RegExp("node_modules/mongoose")
    _.each(require.cache, (v, k) => {
      if (ignore.test(k) && !mongoose.test(k)) return
      delete require.cache[k]
    })
  }
  
  _initializeEventListeners() {
    this.on("app.getPluginInfo", (handler) => {
      handler(this._pluginInfo)
    })
  }
  
  _initializeDataStorage() {
    new StorageManager(this)
  }
  
  _getPlugins() {
    this._availablePlugins = new PluginManager(this.config)
    _.each(this._availablePlugins, (plugin) => {
      this._pluginInfo[plugin._pluginInfo.name] = plugin._pluginInfo
    }, this)
  }

  _bootPlugins(cb) {
    async.each(
      this._availablePlugins,
      this._bootPlugin.bind(this),
      cb
    )
  }

  _bootPlugin(plugin, cb) {
    this.loaded += 1
    // if (this.config.debug) console.log(' ------- ', pluginName)
    plugin(this, cb)
  }

  _getAppIgnorePaths() {
    var opts = this.config.ignore || [];
    return opts.concat([
      '**/.git/**',
      '**.ejs'
    ]);
  }

  _getWatchPaths() {
    return this.config.watch || ["**/node_modules/**", "**/modules/**"];
  }
}

export default Application