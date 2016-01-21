/* 
* @Author: mjreich
* @Date:   2015-05-18 17:03:15
* @Last Modified 2016-01-20
* @Last Modified time: 2016-01-20 20:12:27
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

/**
 * The Core Application class.
 *
 * @param {Object} opts the configuration options
 * @extends Dispatcher
 * @example
 * import {Application} from '@nxus/core'
 * let app = new Application(options)
 * app.start()
 * export default app
 * 
 */
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

  /**
   * Sets up the internal log object. Falls back to console.log.
   * 
   * @private
   */
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

  /**
   * Loads the internal _modules object by instantiating the PluginManager class.
   * 
   * @private
   */
  _setupPluginManager() {
    this._modules = new PluginManager(this.config)
    _.each(this._modules, (plugin) => {
      this._pluginInfo[plugin._pluginInfo.name] = plugin._pluginInfo
    })
  }

  /**
   * Returns an internal Module object for the given name.
   * 
   * @param  {string} name The name of the module to return
   * @return {Module}
   */
  get(name) {
    if(!this._modules[name]) this._modules[name] = new Module(this, name)
    return this._modules[name]
  }

  /**
   * Initializes the application by loading plugins, then booting the application.
   *
   * **Note**: this should rarely be called directly. Instead use #start
   * 
   * @return {Promise}
   */
  init() {
    return this._loadPlugins().then(this.boot.bind(this)).then(() => {
      if (!this.config.script && this.config.NODE_ENV != 'production') {
        this.appWatcher = new Watcher(this, this._getWatchPaths(), 'change', this._getAppIgnorePaths())
      }
    });
  }

  /**
   * Boots the application, cycling through the internal boot stages.
   *
   * **Note**: Should rarely be called directly. Instead use #start
   * 
   * @return {Promise}
   */
  boot() {
    if (this.config.debug) logBanner('Booting Application')
    
    return new Promise.mapSeries(this._bootEvents, (e) => {
      if (this.config.debug) logBanner(`Booting Stage: ${e}`)
      return this.emit(e)
    })
  }

  /**
   * Stops the currently running application, removing all event listeners.
   * 
   * @return {Promise}
   */
  stop() {
    if (this.config.debug) logBanner('Stopping')
    return this.emit("stop").then(() => {
      return Promise.resolve().then(() => {
        Object.keys(this._events).map((event) =>  this.removeAllListeners(event) );
      })
    })
  }

  /**
   * Starts the Nxus application.
   * 
   * @return {Promise}
   */
  start() {
    this.log('*** NXUS APP Started at ' + new Date() + ' ***')
    return this.init()
  }

  /**
   * Restarts the Nxus application.
   * 
   * @return {Promise}
   */
  restart() {
    console.log("Restarting App");
    return this._invalidatePluginsInRequireCache()
    .then(this.stop.bind(this))
    .then(this.start.bind(this))
  }

  /**
   * Invalidates the internal require plugin cache, ensuring all plugins are reloaded from the files.
   * 
   * @private
   * @return {Promise}
   */
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

  /**
   * Returns an array of watch paths, either as defined by `config.watch` or the default paths 
   * `/node_modules` and `/modules`
   *
   * @private
   * @return {Array}
   */
  _getWatchPaths() {
    return this.config.watch || ["**/node_modules/**", "**/modules/**"];
  }

  /**
   * Returns an array of paths to ignore, used by the watcher.
   *
   * @private
   * @return {Array}
   */
  _getAppIgnorePaths() {
    var opts = this.config.ignore || [];
    return opts.concat([
      '**/.git/**',
      '**.ejs'
    ]);
  }

  /**
   * Loads the plugins, then boots them and handles any errors.
   *
   * @private
   * @return {Promise}
   */
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

  /**
   * Iterates through all loaded plugins, instantiating them and returning a promise once every plugin has successfully started.
   * 
   * @private
   * @return {Promise}
   */
  _bootPlugins() {
    return Promise.map(
      this._modules,
      this._bootPlugin.bind(this)
    ).catch((e) => {
      console.log('Error booting plugin')
      console.trace(e);
    })
  }

  /**
   * Accepts an instatiatable object (function or class) as a plugin, then boots it.
   *
   * @private
   * @param  {Function|Class} plugin the instantiable plugin
   * @return {[type]}
   */
  _bootPlugin(plugin) {
    //if (this.config.debug) console.log(' ------- ', plugin)
    try {
      if(plugin.default)
        plugin = plugin.default
      plugin = new plugin(this);
    } catch(e) {
      console.log(e.stack)
      process.exit();
    }
    return Promise.resolve(plugin)
  }
}
