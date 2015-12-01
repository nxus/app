/* 
* @Author: mike
* @Date:   2015-05-18 17:03:15
* @Last Modified 2015-11-24
* @Last Modified time: 2015-11-24 08:55:39
*/

import _ from 'underscore'
import util from 'util'
import fs from 'fs'
import domain from 'domain'
import path from 'path'

import Dispatcher from './Dispatcher'
import Module from './Module'
import PluginManager from './PluginManager'
import ConfigurationManager from './ConfigurationManager'
import Watcher from './Watcher'

var logBanner = (message) => {
  console.log(' --- ')
  console.log(' --- '+ message)
}

export default class Application extends Dispatcher {

  constructor(opts = {}) {
    super()
    this._modules = {}
    this._pluginInfo = {}
    this._bootEvents = [
      'init',
      'load',
      'startup',
      'launch'
    ]

    this._setupLog()

    opts.appDir = opts.appDir || path.dirname(require.main.filename)

    this.config = Object.assign(opts, new ConfigurationManager(opts).getConfig())
    
    if(typeof this.config.debug === 'undefined') this.config.debug = (!process.env.NODE_ENV || process.env.NODE_ENV == 'development')
  }

  _setupLog() {
    this.log = (...args) => {
      if(this.config.debug) console.log.apply(this, args)
    }

    this.log = Object.assign(this.log, console, {
      debug: (...args) => {
        if(this.config.debug) console.log.apply(this, args)
      }, 
      info: (...args) => {
        if(this.config.debug) console.log.apply(this, args)
      } 
    })
  }

  _setupPluginManager() {
    this._modules = new PluginManager(this.config)
    _.each(this._modules, (plugin) => {
      this._pluginInfo[plugin._pluginInfo.name] = plugin._pluginInfo
    })
  }

  get(module) {
    if(!this._modules[module]) this._modules[module] = new Module(this, module)
    return this._modules[module]
  }

  init() {
    return this._loadPlugins().then(this.boot.bind(this))
    if (!this.config.script && this.config.NODE_ENV != 'production') {
      this.appWatcher = new Watcher(this, this._getWatchPaths(), 'change', this._getAppIgnorePaths())
    }
  }

  boot() {
    if (this.config.debug) logBanner('Booting Application')
    
    return new Promise.mapSeries(this._bootEvents, (e) => {
      logBanner(`Booting Stage: ${e}`)
      return this.emit(e).with()
    })
  }

  stop() {
    if (this.config.debug) logBanner('Stopping')
    return this.emit("stop").then(() => {
      return Promise.resolve().then(() => {
        this._events.map((event) => this.removeAllListeners(event))
      })
    })
  }

  start() {
    this.log('*** NXUS APP Started at ' + new Date() + ' ***')
    return this.init()
  }

  restart() {
    console.log("Restarting App");
    return this._invalidatePluginsInRequireCache()
    .then(this.stop)
    .then(this.init)
  }

  _invalidatePluginsInRequireCache() {
    return Promise.resolve().then(() => {
      // we only want to reload nxus code
      var ignore = new RegExp("^(.*node_modules/(?!@nxus).*)")
      // but we need to always reload mongoose so that models can be rebuilt
      var mongoose = new RegExp("node_modules/mongoose")
      _.each(require.cache, (v, k) => {
        if (ignore.test(k) && !mongoose.test(k)) return
        delete require.cache[k]
      })
    })
  }

  _getWatchPaths() {
    return this.config.watch || ["**/node_modules/**", "**/modules/**"];
  }

  _getAppIgnorePaths() {
    var opts = this.config.ignore || [];
    return opts.concat([
      '**/.git/**',
      '**.ejs'
    ]);
  }

  _loadPlugins() {
    this._setupPluginManager()
    if (this.config.debug) {
      logBanner('Loading plugins')
    }

    return this._bootPlugins().catch((err) => {
      if (err) {
        console.log(err)
        process.exit()
      }
    })
  }

  _bootPlugins() {
    return Promise.map(
      this._modules,
      this._bootPlugin.bind(this)
    )
  }

  _bootPlugin(plugin) {
    //if (this.config.debug) console.log(' ------- ', plugin)
    return Promise.resolve(new plugin(this))
  }
}
