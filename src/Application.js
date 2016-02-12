/* 
* @Author: mjreich
* @Date:   2015-05-18 17:03:15
* @Last Modified 2016-02-12
* @Last Modified time: 2016-02-12 12:08:06
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
import Logger from './Logger'

var startupBanner = () => {
  console.log(" \n"+
" _______ _______ __    _ __   __ __   __ _______ __  \n"+
"|       |       |  |  | |  |_|  |  | |  |       |  | \n"+
"|    ___|   _   |   |_| |       |  | |  |  _____|  | \n"+
"|   | __|  | |  |       |       |  |_|  | |_____|  | \n"+
"|   ||  |  |_|  |  _    ||     ||       |_____  |__| \n"+
"|   |_| |       | | |   |   _   |       |_____| |__  \n"+
"|_______|_______|_|  |__|__| |__|_______|_______|__| \n"
)
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
    this._currentStage = null

    opts.appDir = opts.appDir || path.dirname(require.main.filename)

    this.config = Object.assign(opts, new ConfigurationManager(opts).getConfig())
    if(typeof this.config.debug === 'undefined') this.config.debug = (!process.env.NODE_ENV || process.env.NODE_ENV == 'development')
    this._setupLog()
  }

  /**
   * Sets up the internal log object. Falls back to console.log.
   * 
   * @private
   */
  _setupLog() {
    if(this.config.silent) {
      this.log = function() {}
      Object.assign(this.log, {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {}
      })
    } else {
      var logger = Logger(this)
      this.log = (...args) => {
        logger.debug.apply(this, args)
      }
      this.log = Object.assign(this.log, logger)
    }
  }

  /**
   * Loads the internal _modules object by instantiating the PluginManager class.
   * 
   * @private
   */
  _setupPluginManager() {
    this._modules = new PluginManager(this, this.config)
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
        this.log.debug('Setting up App watcher')
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
    if (this.config.debug) this.log.info('Booting Application')
    return new Promise.mapSeries(this._bootEvents, (e) => {
      this._currentStage = e
      if (this.config.debug) this.log.info(`Booting Stage: ${e}`)
      return this.emit(e)
    })
  }

  /**
   * Stops the currently running application, removing all event listeners.
   * 
   * @return {Promise}
   */
  stop() {
    if (this.config.debug) this.log.info('Stopping')
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
    if(!this.config.silent) startupBanner()
    this.log.info('NXUS APP Starting')
    return this.init()
  }

  /**
   * Restarts the Nxus application.
   * 
   * @return {Promise}
   */
  restart() {
    this._currentStage = 'restarting'
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
    this.log.info('Loading modules')
    this._setupPluginManager()
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
      this.log.warn('Error booting module', e)
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
      this.log.debug('Booting Module', (plugin._packageJson ? plugin._packageJson.name : plugin.name))
      if(plugin.default)
        plugin = plugin.default
      plugin = new plugin(this);
    } catch(e) {
      this.log.warn('Error booting module', (plugin._packageJson ? plugin._packageJson.name : plugin.name))
      this.log.warn(e.stack)
    }
    return Promise.resolve(plugin)
  }
}
