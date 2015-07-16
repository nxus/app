/* 
* @Author: mike
* @Date:   2015-05-18 17:03:15
* @Last Modified 2015-07-16
* @Last Modified time: 2015-07-16 08:49:06
*/

var EventEmitter = require('events').EventEmitter
var _ = require('underscore')
var util = require('util')
var fs = require('fs')
var async = require('async')
var domain = require('domain')

var PluginManager = require('./PluginManager')
var BootStage = require('./BootStage')
var ConfigurationManager = require('./ConfigurationManager')
var StorageManager = require('./StorageManager')
var Watcher = require('./Watcher')

var logBanner = (message) => {
  console.log(' --- ')
  console.log(' --- '+ message)
  console.log(' --- ')
}

var pluginDir = './storage/config'
var pluginConfig = pluginDir + '/plugins.json'

class Application extends EventEmitter {
  
  constructor(options = {}) {
    super()

    this._plugins = {}
    this._pluginInfo = {}
    this._availablePlugins = []
    this._enabledPlugins = []
    this._events = []
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

    this.config = _.extend(options, new ConfigurationManager().getConfig())
    this.setMaxListeners(100000) // supress node v0.11+ warning

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
    Application overrides EventEmitter's `emit` function to provide simple event
    handler ordering with `.before` and `.after` suffixes indicating that the 
    handlers should be called before or after handlers for the event with no 
    suffix
    
    For example, the following prints 1, 2, and 3 in order: 
    
    ```
    app.on('print.before', (n) => { console.log(n) })
    app.on('print', (n) => { console.log(n+1) })
    app.on('print.after', (n) => { console.log(n+2) })
    
    app.emit('print', 1)
    ```
   */
  emit() {
    try {
      if (arguments[0] == "newListener") return super.emit.apply(this, arguments)

      var args = Array.prototype.slice.call(arguments)
      var beforeArgs = Array.prototype.slice.call(arguments)
      beforeArgs[0] = beforeArgs[0]+".before"
      var afterArgs = Array.prototype.slice.call(arguments)
      afterArgs[0] = afterArgs[0]+".after"

      super.once.apply(this, [beforeArgs[0], ((a) => {
        return () => {super.emit.apply(this, a)}
      })(args)])

      super.once.apply(this, [arguments[0], ((a) => {
        return () => {super.emit.apply(this, a)}
      })(afterArgs)])

      super.emit.apply(this, beforeArgs)
    } catch (e) {
      var logger = console
      if (this.log && this.log.error) logger = this.log
      logger.error("Exception processing event: " + arguments[0], e.stack, e)
    }
  }

  /*
   * Application control methods
   */

  init(cb) {
    this._initializeDataStorage()
    this._initializeFileStorage()
    this._initializeEventListeners()
    this._loadPlugins()
    
    if (this.config.NODE_ENV != 'production') {
      this.appWatcher = new Watcher(this, null, 'change.app', this._getAppIgnorePaths())
    }

    this.boot(cb)
  }

  boot(cb) {
    if (this.config.debug) logBanner('Booting Application')
    async.eachSeries(
      this._bootEvents,
      (e, callback) => {
        if (this.config.debug) logBanner(e)
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
    this.domain.run(() => {
      this.init()   
    })
  }

  restart(cb) {
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
    this.on('newListener', (event, listener) => {
      this._events.push(event)
    })

    this.on("app.getPluginInfo", (handler) => {
      handler(this._pluginInfo)
    })
  }
  
  _initializeDataStorage() {
    new StorageManager(this)
  }
  
  _initializeFileStorage() {
    if(!this.config.file_dir)
      this.config.file_dir = process.cwd()+"/storage/uploads"

    if(!fs.existsSync(this.config.file_dir))
      this.config.file_dir = process.cwd()+"/storage/uploads"

    if (!fs.existsSync(process.cwd() + '/storage'))
      fs.mkdirSync(process.cwd() + '/storage')

    if(!fs.existsSync(this.config.file_dir))
      fs.mkdirSync(this.config.file_dir)
  }
  
  _getPlugins() {
    this._availablePlugins = new PluginManager().get()
    _.each(this._availablePlugins, (plugin) => {
      this._pluginInfo[plugin._pluginInfo.name] = plugin._pluginInfo
    }, this)
  }

  _saveEnabledPlugins(plugins) {
    //Sanity check plugins
    if(_.isArray(plugins)) {
      fs.writeFileSync(pluginConfig, JSON.stringify(plugins, null, 2), 'utf8')
    }
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
    return this._getWatchPaths().concat([
      '**/.git/**',
      '**.ejs'
    ])
  }

  _getWatchPaths() {
    var _clientScripts = []
    var _adminScripts = []
    return _.pluck(_clientScripts, 'path')
      .concat(_.pluck(_adminScripts, 'path'))
      .concat([__dirname + '/../lib/'])
  }
}

module.exports = Application