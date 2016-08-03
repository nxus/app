/* 
* @Author: mjreich
* @Date:   2015-05-18 17:03:15
* @Last Modified 2016-08-03
* @Last Modified time: 2016-08-03 16:57:34
*/
/**
 * [![Build Status](https://travis-ci.org/nxus/core.svg?branch=master)](https://travis-ci.org/nxus/core)
 * 
 * The Nxus Core package includes the basic Application framework for building a Nxus app.
 * 
 * ## Introduction
 * 
 * You'll probably find the following resources useful background and help in building Nxus applcations.
 * 
 * -   [Getting Started](<>) (TODO)
 * -   [Design Patterns](<>) (TODO)
 * -   [Nxus Modules](<>) (TODO)
 * -   [Recipes](<>) (TODO)
 * -   [Developing a ](<>) (TODO)
 * 
 * ## Documentation
 * 
 * The full set of Nxus docs is available at [http://docs.gonxus.org](http://docs.gonxus.org).
 * 
 * ## Installation
 * 
 *     > npm install @nxus/core --save
 * 
 * ## Usage
 * 
 * In your root application, create a new Application instance:
 * 
 *     import {Application} from '@nxus/core'
 * 
 *     let app = new Application(options)
 * 
 *     app.start()
 * 
 *     export default app
 * 
 * ### Events
 * 
 * Nxus is built around the concept of a boot cycle.  The application dispatches events in the following order:
 *
 * | Boot Stage | Description |
 * | --- | --- |
 * | `init` | indicates the application is starting up and initializing modules.  Other modules are not gauranteed to be available at this phase. |
 * | `load` | modules are initialized and loading. This is the place to do any internal setup (outside of the constructor). Other modules are not gauranteed to be available at this phase. |
 * | `startup` | all modules have been loaded and are available. This is the place to do any setup that requires data/input from other modules (like Storage) |
 * | `launch` | the application is launching and all services have been started. Routes are accessible. Use onceAfter('launch') to gaurantee execution after the application has completely launched |
 * 
 * ### Module Loading
 * 
 * By defaul the Application will look for other Nxus modules in the following order:
 * 
 * 1.  @nxus namespaced npm modules in your `package.json` file.
 * 2.  Any packages that match the 'namespace-' pattern passed in the `namespace` application config option.
 * 3.  folders in the ./modules folder in the root of your project
 * 4.  any modules specified in the _modules_ option passed into Application on instantiation.
 * 
 * ### Module Access
 * 
 * In order to access module commands, use the Application.get() method.
 * 
 *     let router = Application.get('router')
 * 
 * ### Application Options
 *
 * ```
 * new App(...options)
 * ```
 * 
 * Available options are:
 * 
 * _appDir_: the location to use to load the default 'package.json' file. 
 * 
 * _namespace_: any additional namespaces to use to load modules in the node\_modules folder. Can be a string or array of strings.
 * 
 * _modules_: an array of paths to require into the application
 * 
 * _debug_: Boolean to display debug messages, including startup banner
 * 
 * _script_: Boolean to indicate the application is a CLI script, silences all logging/output messages except for explicit console.log calls
 *
 * ### Application Configuration
 *
 * The Application exposes a core `config` object that contains application and module specific configuration values.
 *
 * Nxus uses the [rc](https://www.npmjs.com/package/rc) library to provide application configuration.
 *
 * The application configuration can usually be found in a `.nxusrc` file in the root folder.
 *
 * You can override specific confirguation values using command line environment variables, which supports nesting.
 *
 * ```
 * nxus_myconfig__value__first=true npm start
 * ```
 *
 * will translate into an application config of
 *
 * ```
 * console.log(app.config.myconfig) // {value: {first: true}}
 * ```
 * 
 * ## API
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

var _defaultConfig = {
  siteName: 'Nxus App',
  host: 'localhost',
  baseUrl: 'localhost:3001'
}

_.mixin(require('underscore.deep'))

var startupBanner = " _______ _______ __    _ __   __ __   __ _______ __  \n"+
    "|       |       |  |  | |  |_|  |  | |  |       |  | \n"+
    "|    ___|   _   |   |_| |       |  | |  |  _____|  | \n"+
    "|   | __|  | |  |       |       |  |_|  | |_____|  | \n"+
    "|   ||  |  |_|  |  _    ||     ||       |_____  |__| \n"+
    "|   |_| |       | | |   |   _   |       |_____| |__  \n"+
    "|_______|_______|_|  |__|__| |__|_______|_______|__| \n"

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
    this._opts = opts
    this._modules = {}
    this._pluginInfo = {}
    this._currentStage = null
    this._banner = opts.banner || startupBanner
    this._defaultConfig = {};
    this.config = {};
    
    this._bootEvents = [
      'init',
      'load',
      'startup',
      'launch'
    ]

    this._setupConfig()
    this._setupLog()

    this.after('launch', () => {
      this._writeConfig()
    })

    this.registeredModules = {}
    this.on('registeredModule', (name) => {
      this.registeredModules[name] = true
    })
  }

  _showBanner() {
      console.log(" \n"+this._banner)
  }

  /**
   * Sets up the internal config
   *
   * @private
   */
  _setupConfig() {    
    this._opts.appName = this._opts.appName || "NXUS App"
    this._opts.namespace = this._opts.namespace || "nxus"
    this._opts.appDir = this._opts.appDir || process.cwd()

    this.writeDefaultConfig(null, _defaultConfig)
        
    this.config = Object.assign(this.config, this._opts, new ConfigurationManager(this._opts).getConfig())
    if(typeof this.config.debug === 'undefined') this.config.debug = (!process.env.NODE_ENV || process.env.NODE_ENV == 'development')
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
    if(!this.config.silent) this._showBanner()
    this.log.info(this.name+' Starting')
    return this.init()
  }

  /**
   * Restarts the Nxus application.
   * 
   * @return {Promise}
   */
  restart() {
    this._currentStage = 'restarting'
    this.log.info("Restarting App");
    return this._invalidatePluginsInRequireCache()
    .then(this.stop.bind(this))
    .then(this._setupConfig.bind(this))
    .then(this.start.bind(this))
  }

  writeDefaultConfig(name, opts) {
    if(name && name != "") {
      this._defaultConfig[name] = _.deepClone(opts)
      if(!this.config[name]) this.config[name] = opts
    } else {
      Object.assign(this._defaultConfig, opts)
      Object.assign(this.config, opts)
    }
  }

  _writeConfig() {
    if(!this.config.config) return
    var configFile = this.config.config
    var config = {}
    if(fs.existsSync(configFile)) config = JSON.parse(fs.readFileSync(configFile))
    _.each(this._defaultConfig, (value, key) => {
      if(!config[key]) {
        config[key] = value
      }
    })
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  }

  /**
   * Invalidates the internal require plugin cache, ensuring all plugins are reloaded from the files.
   * 
   * @private
   * @return {Promise}
   */
  _invalidatePluginsInRequireCache() {
    return new Promise((resolve) => {
      // we only want to reload nxus code
      var ignore = new RegExp("^(.*node_modules/(?!@nxus).*)")
      // but we need to always reload mongoose so that models can be rebuilt
      var mongoose = new RegExp("node_modules/mongoose")
      _.each(require.cache, (v, k) => {
        if (ignore.test(k) && !mongoose.test(k)) return
        delete require.cache[k]
      })
      resolve()
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
    let watch = ["**/node_modules/**", "**/modules/**"]
    if(_.isString(this.config.watch)) this.config.watch = [this.config.watch]
    return watch.concat(this.config.watch || [])
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
        this.log.error(err)
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
      this.log.error('Error booting module', e)
      this.log.error(e.stack);
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
    let name = plugin._pluginInfo.name
    //if (this.config.debug) console.log(' ------- ', plugin)
    try {
      this.log.debug('Booting Module', name)
      if(plugin.default)
        plugin = plugin.default
      plugin = new plugin(this);
    } catch(e) {
      this.log.error('Error booting module', name)
      this.log.error(e.stack)
    }
    return Promise.resolve(plugin)
  }
}
