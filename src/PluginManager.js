/* 
* @Author: mike
* @Date:   2015-05-18 17:05:09
* @Last Modified 2016-07-28
* @Last Modified time: 2016-07-28 07:44:36
*/

'use strict';

import findup from 'findup-sync'
import multimatch from 'multimatch'
import fs from 'fs'
import path from 'path'
import _ from 'underscore'

/**
 * The PluginManager handles all of the module loading.  Load order is as follows:
 *
 * 1. Packages in node_modules that match the passed `namespace` config option, and packages in the `@nxus` namespace.
 * 2. Folders in the <appDir>/modules directory.
 * 3. Filepaths passed in the `modules` config option
 */
class PluginManager {

  constructor(app, options) {
    this.app = app
    this.options = options = options || {}

    this._loaded = []

    this.packages = []

    this.loadNxusModules(options)
    this.loadAdditionalModules(options)
    //this.loadAppModules(options)
    return this.packages
  }

  /**
   * @private
   * Helper method to ensure a passed variable is an array. Wraps the value in an array if it isn't already.
   * @param  {anything} el the item to ensure is an array
   * @return {Array}    either a new empty array, or el as is if its an array, or el wrapped in an array.
   */
  _arrayify(el) {
    if(!el) return []
    return Array.isArray(el) ? el : [el]
  }

  /**
   * [loadNxusModules description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  loadNxusModules(options) {
    var nxusCorePath = (options.nxusModulesDir || process.cwd())+"/node_modules"

    var pattern = _.unique(this._arrayify(options.namespace).concat(['nxus-*', '!nxus-core']))

    this._loadModulesFromDirectory(nxusCorePath, pattern)
  }

  /**
   * [loadAdditionalModules description]
   * @param  {[type]} options  [description]
   * @param  {[type]} packages [description]
   * @return {[type]}          [description]
   */
  loadAdditionalModules(options, packages) {
    var customDir = options.modulesDir || options.appDir+'/modules'
    if(!_.isArray(customDir)) customDir = [customDir]
    _.each(customDir, (dir) => {
      this._loadModulesFromDirectory(dir)
    })
  }

  /**
   * @private
   * [_loadModulesFromDirectory description]
   * @param  {[type]} dir     [description]
   * @param  {[type]} matches [description]
   * @return {[type]}         [description]
   */
  _loadModulesFromDirectory(dir, matches) {
    if (!fs.existsSync(dir)) return

    var moduleDirs = fs.readdirSync(dir)
    
    moduleDirs.forEach((name) => {
      if(matches) name = multimatch([name], matches)[0]
      if(!name || (name && name[0] == ".")) return
      this.app.log.debug('Loading module', name)
      try {
        var pkg = require(path.resolve(dir + "/" + name))
        pkg._pluginInfo = {name}
        this.packages.push(pkg)
        //if(fs.existsSync(dir + "/" + name + "/node_modules")) 
          //this._loadModulesFromDirectory(dir + "/" + name + "/node_modules", matches)
      } catch (e) {
        this.app.log.error('Error loading module', name)
        this.app.log.error(e)
        process.kill(process.pid, 'SIGTERM')
      }
    })

    // Recurse for module modules
    this._loadModulesFromDirectory(dir+'/modules')
  }

  /**
   * Loads manually passed in packages by path
   * @param  {object} options  configuration options
   * @param  {packages} packages the array of packages currently loaded by Nxus
   */
  loadPassedPlugins(options, packages) {
    var customPluginDirs = options.modules || []
    
    customPluginDirs.forEach((modulePath) => {
      this.app.log.debug('Loading custom module', modulePath)
      var pkg = require(modulePath)
      pkg._packageJson = this.getPluginPackageJson(modulePath)
      pkg._pluginInfo = {}
      if(pkg._packageJson)
        pkg._pluginInfo.name = pkg._packageJson.name || null
      packages.push(pkg)
    })
  }
}

export default PluginManager
