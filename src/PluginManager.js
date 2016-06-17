/* 
* @Author: mike
* @Date:   2015-05-18 17:05:09
* @Last Modified 2016-05-19
* @Last Modified time: 2016-05-19 20:34:22
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
   * Helper method to ensure a passed variable is an array. Wraps the value in an array if it isn't already.
   * @param  {anything} el the item to ensure is an array
   * @return {Array}    either a new empty array, or el as is if its an array, or el wrapped in an array.
   */
  arrayify(el) {
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

    var pattern = _.unique(this.arrayify(options.namespace).concat(['nxus-*', '!nxus-core']))

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
  }
  
  /**
   * Loads a package
   * @param  {string} name      The name of the package
   * @param  {string} directory A path to the package
   * @param  {array} packages  An array of the currently loaded packages
   */
  // loadPackage(name, directory, packages) {
  //   if(_.contains(this._loaded, name)) return
  //   if(name.indexOf("@nxus/") == -1 && name.indexOf("nxus-") == -1) return
  //   if(name.indexOf("@nxus/core") > -1) return
  //   this.app.log.debug('Loading node module ' + name)
  //   var pkg
  //   this._loaded.push(name)
  //   if (fs.existsSync(directory)) {
  //     pkg = this.accumulatePackage(packages, directory)
  //   }
  //   if(!pkg) return
  //   var peerDeps = (pkg._packageJson && pkg._packageJson.peerDependencies) || {}
  //   for(let dep in peerDeps) {
  //     this.loadPackage(dep, this.options.nodeModulesDir+"/node_modules/"+dep, packages)
  //   }
  //   var getPackages = (packages, targets, directory) => {
  //     targets.forEach((t) => {
  //       if(t.indexOf("@nxus/") < 0 && t.indexOf("nxus-") < 0) return
  //       if(t.indexOf("@nxus/core") > -1) return
  //       var innerDir = path.join(directory, 'node_modules') + '/' + t
  //       var innerPkg = this.accumulatePackage(packages, innerDir)
  //       if(!innerPkg) return
  //       // recurse through all child packages
  //       getPackages(
  //         packages,
  //         this.getDeps(innerPkg),
  //         innerDir
  //       )
  //     })
  //   }
  //   getPackages(packages, this.getDeps(pkg), directory)
  // }

  /**
   * Loads all Nxus pacakges for an application
   * @param  {object} options  options to use to load the packages
   * @param  {packages} packages the array of packages currently loaded by Nxus
   */
  // loadPackages(options, packages) {
  //   var pattern = this.arrayify(
  //     options.namespace
  //   )

  //   options.namespace = _.map(options.namespace, (n) => {
  //     if(n.indexOf('@') == -1) n = n+"-*"
  //     return n
  //   })

  //   pattern = _.unique(pattern.concat(['@nxus/*', 'nxus-*', '!@nxus/core']))

  //   if(options.nodeModulesDir && fs.existsSync(options.nodeModulesDir+"/package.json"))
  //     options.config = options.nodeModulesDir+"/package.json"

  //   var config = options.config || findup('package.json')
  //   var scope = this.arrayify(
  //     options.scope
  //     || ['dependencies', 'devDependencies', 'peerDependencies']
  //   )
  //   if (typeof config === 'string') {
  //     config = require(path.resolve(config))
  //   }
  //   if(!config) return
  //   var names = scope.reduce((result, prop) => {
  //     return result.concat(Object.keys(config[prop] || {}))
  //   }, [])
  //   // find matched package names
  //   var matched = multimatch(names, pattern)
  //   matched.forEach((() => {
  //     return (name) => {
  //       var dir = (options.nodeModulesDir || ".")+"/node_modules/"+name
  //       this.loadPackage(name, dir, packages)
  //     }
  //   })())
  // }

  /**
   * Loads custom plugins in the <appDir>/<modulesDir> directory
   * @param  {object} options  configuration options
   * @param  {packages} packages the array of packages currently loaded by Nxus
   */
  

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