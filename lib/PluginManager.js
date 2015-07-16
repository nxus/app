/* 
* @Author: mike
* @Date:   2015-05-18 17:05:09
* @Last Modified 2015-07-16
* @Last Modified time: 2015-07-16 09:20:59
*/

'use strict';

var findup = require('findup-sync')
var multimatch = require('multimatch')
var fs = require('fs')
var path = require('path')
var _ = require('underscore')

class PluginManager {

  get(options) {
    options = options || {}

    var packages = []

    this.loadPackages(options, packages)
    this.loadCustomPlugins(options, packages)

    return packages
  }

  arrayify(el) {
    return Array.isArray(el) ? el : [el]
  }

  getPluginPackageJson(path) {
    return JSON.parse(fs.readFileSync(path + "/package.json", "utf8"))
  }

  getDeps(pkg) {
    var deps = pkg._packageJson.dependencies || {}
    return _.filter(Object.keys(deps), function (packageName) {
        return packageName.indexOf("@nxus/") === 0
      }) || []
  }
  
  accumulatePackage(packages, directory) {
    var pkg = require(fs.realpathSync(directory))
    pkg._packageJson = this.getPluginPackageJson(directory)
    pkg._pluginInfo = {}
    pkg._pluginInfo.name = pkg._packageJson.name
    packages.push(pkg)
    return pkg
  }
  
  loadPackage(name, packages) {
    if (process.env.debug) console.log('loading package ' + name)
    var directory = './node_modules/' + name
    var pkg
    if (fs.existsSync(directory)) {
      pkg = this.accumulatePackage(packages, directory)
    }

    var getPackages = (packages, targets, directory) => {
      targets.forEach((t) => {
        var innerDir = path.join(directory, 'node_modules') + '/' + t
        var innerPkg = this.accumulatePackage(packages, innerDir)
        // recurse through all child packages
        getPackages(
          packages,
          this.getDeps(innerPkg),
          innerDir
        )
      })
    }
    getPackages(packages, this.getDeps(pkg), directory)
  }

  loadPackages(options, packages) {
    var pattern = this.arrayify(
      options.pattern
      || ['@nxus/*', '!@nxus/core']
    )
    var config = options.config || findup('package.json')
    var scope = this.arrayify(
      options.scope
      || ['dependencies', 'devDependencies', 'peerDependencies']
    )
    if (typeof config === 'string') {
      config = require(path.resolve(config))
    }
    var names = scope.reduce((result, prop) => {
      return result.concat(Object.keys(config[prop] || {}))
    }, [])
    // find matched package names
    var matched = multimatch(names, pattern)

    matched.forEach((() => {
      return (name) => {
        this.loadPackage(name, packages)
      }
    })())
  }

  loadCustomPlugins(options, packages) {
    if (!fs.existsSync('./plugins')) return

    var customPluginDirs = fs.readdirSync('./plugins')
    
    customPluginDirs.forEach((name) => {
      var pkg = require(path.resolve('./plugins/' + name))
      pkg._packageJson = this.getPluginPackageJson('./plugins/' + name)
      pkg._pluginInfo = {}
      pkg._pluginInfo.name = pkg._packageJson.name || null
      packages.push(pkg)
    })
  }
}

module.exports = PluginManager