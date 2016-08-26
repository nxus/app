/* 
* @Author: mjreich
* @Date:   2015-05-18 17:03:15
* @Last Modified 2016-08-25
* @Last Modified time: 2016-08-25 15:36:12
*/

import _ from 'underscore'
import util from 'util'
import fs from 'fs'
import domain from 'domain'
import path from 'path'

import Dispatcher from './Dispatcher'
import ModuleProxy from './ModuleProxy'
import PluginManager from './PluginManager'
import ConfigurationManager from './ConfigurationManager'
import Watcher from './Watcher'
import {logger} from './Logger'

var _defaultConfig = {
  siteName: 'Nxus App',
  host: 'localhost',
  baseUrl: 'localhost:3001',
  appName: 'App',
  namespace: 'nxus',
  appDir: process.cwd()
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
 * 
 * The Core Application class.
 *
 * ### Configuration Options
 * 
 * Available options are:
 *
 * | Name | Description |
 * | --- | --- |
 * | appName | the name of your app. Will be used for console logging. |
 * | appDir | the location to use to load the default 'package.json' file. |
 * | namespace | any additional namespaces to use to load modules in the node\_modules folder. Can be a string or array of strings. |
 * | modules | an array of paths to require into the application |
 * | debug | Boolean to display debug messages, including startup banner |
 * | script | Boolean to indicate the application is a CLI script, silences all logging/output messages except for explicit console.log calls |
 * | silent | Don't show any console output. Useful for CLI scripts. |
 * 
 * @param {Object} opts the configuration options
 * @extends Dispatcher
 * @example
 * import {application} from 'nxus-core'
 * 
 * application.start()
 *
 * export default application
 *
 * 
 */


export default class Application extends Dispatcher {

  constructor(opts = {}) {
    super()
    this._opts = opts
    this._modules = {}
    this._moduleProxies = {}
    this._pluginInfo = {}
    this._pluginInstances = {}
    this._currentStage = null
    this._banner = opts.banner || startupBanner
    this._defaultConfig = {}
    this.config = {}
    
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
    this.setDefaultConfig(null, _defaultConfig)
        
    this.config = Object.assign(this.config, new ConfigurationManager(this.config).getConfig(), this._opts)
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
      this.log = logger
    }
  }

  /**
   * Loads the internal _modules object by instantiating the PluginManager class.
   * 
   * @private
   */
  _setupPluginManager() {
    this._modules = new PluginManager(this, this.config)
    this._modules.forEach((plugin) => {
      this._pluginInfo[plugin._pluginInfo.name] = plugin._pluginInfo
    })
  }

  /**
   * Returns an internal ModuleProxy object for the given name.
   * 
   * @param  {string} name The name of the module to return
   * @return {ModuleProxy}
   */
  get(name) {
    if(!this._moduleProxies[name]) {
      this._moduleProxies[name] = new ModuleProxy(this, name)
    }
    return this._moduleProxies[name]
  }

  /**
   * @private
   * Initializes the application by loading plugins, then booting the application.
   *
   * **Note**: this should rarely be called directly. Instead use #start
   * 
   * @return {Promise}
   */
  _init() {
    this._pluginInstances = {}
    return this._loadPlugins().then(::this._boot).then(() => {
      if (!this.config.script && this.config.NODE_ENV != 'production') {
        this.log.debug('Setting up App watcher')
        this.appWatcher = new Watcher(this, this._getWatchPaths(), 'change', this._getAppIgnorePaths())
      }
    })
  }

  /**
   * @private
   * Boots the application, cycling through the internal boot stages.
   *
   * **Note**: Should rarely be called directly. Instead use #start
   * 
   * @return {Promise}
   */
  _boot() {
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
    return this.emit('stop').then(() => {
      return Promise.resolve().then(() => {
        Object.keys(this._events).map((event) =>  this.removeAllListeners(event) )
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
    this.log.info(this.config.appName+' Starting at', new Date())
    return this._init()
  }

  /**
   * Restarts the Nxus application.
   * 
   * @return {Promise}
   */
  restart() {
    this._currentStage = 'restarting'
    this.log.info('Restarting App')
    return this._invalidatePluginsInRequireCache()
    .then(::this.stop)
    .then(::this._setupConfig)
    .then(::this.start)
  }

  setDefaultConfig(name, opts) {
    if(name && name != '') {
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
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2))
  }

  /**
   * Invalidates the internal require plugin cache, ensuring all plugins are reloaded from the files.
   * 
   * @private
   * @return {Promise}
   */
  _invalidatePluginsInRequireCache() {
    let nxusModules = this._modules.map((x) => { return x._pluginInfo.modulePath })

    return new Promise((resolve) => {
      let invalid = new RegExp('^.*('+nxusModules.join('|')+').*.js')
      _.each(require.cache, (v, k) => {
        if (invalid.test(k)) {
          delete require.cache[k]
        }
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
    let watch = ['**/node_modules/**', '**/modules/**']
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
    var opts = this.config.ignore || []
    return opts.concat([
      '**/.git/**',
      '**.ejs'
    ])
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
      ::this._bootPlugin
    ).catch((e) => {
      this.log.error('Error booting module', e)
      this.log.error(e.stack)
    })
  }

  /**
   * Accepts an instantiable object (function or class) as a plugin, then boots it.
   *
   * @private
   * @param  {Function|Class} plugin the instantiable plugin
   * @return {[type]}
   */
  _bootPlugin(plugin) {
    var name = plugin._pluginInfo.name
    let pluginInstance = null
    //if (this.config.debug) console.log(' ------- ', plugin)
    if (this._pluginInstances[name] !== undefined) {
      this.log.error('Duplicate module found', name)
      process.exit()
    }
    try {
      this.log.debug('Booting Module', name)
      if(plugin.default)
        plugin = plugin.default
      pluginInstance = new plugin(this)
      this._pluginInstances[name] = pluginInstance
    } catch(e) {
      this.log.error('Error booting module '+name, e)
      this.log.error(e.stack)
      process.exit()
    }
    return Promise.resolve(pluginInstance)
  }

}

export let application = new Application()
