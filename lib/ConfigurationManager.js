/* 
* @Author: mike
* @Date:   2015-05-18 17:04:13
* @Last Modified 2015-07-16
* @Last Modified time: 2015-07-16 08:06:12
*/

'use strict';

var fs = require('fs')
var path = require('path')
var _ = require('underscore')

class ConfigurationManager {

  constructor(opts = {}) {
    this.appDir = opts.appDir || path.dirname(require.main.filename)
  }

  getNodeEnv() {
    return process.env.NODE_ENV || 'dev'
  }

  getPackageJSONConfig() {
    var config = {};
    var jsonPath = path.resolve(this.appDir + '/package.json')
    if(fs.existsSync(jsonPath)) {
      try {
        var jsonParsed = JSON.parse(fs.readFileSync(jsonPath))
        config = jsonParsed.config[this.getNodeEnv()]
      } catch(e) {
        console.log('Warning: error parsing config file', jsonPath)
      }
    }
    return config
  }

  getEnvironmentVariables() {
    // alias the MONGO_URI variable as `db`
    if (process.env.MONGO_URI) {
      process.env.db = process.env.MONGO_URI
    }
    // default port for HTTP
    if (!process.env.PORT) {
      process.env.PORT = 3000
    }
    return process.env
  }

  getConfig() {
    return _.extend(
      // Read the config in the app's package.json
      this.getPackageJSONConfig() || {},
      // Environment variables take precedence
      this.getEnvironmentVariables(),
      // but NODE_ENV must be present so, ensure it
      {NODE_ENV: this.getNodeEnv()}
    )
  }
}

module.exports = ConfigurationManager