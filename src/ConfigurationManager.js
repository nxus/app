/* 
* @Author: mike
* @Date:   2015-05-18 17:04:13
* @Last Modified 2015-12-08
* @Last Modified time: 2015-12-08 17:24:21
*/

'use strict';

import fs from 'fs'
import _ from 'underscore'
import path from 'path'

class ConfigurationManager {

  constructor(opts = {}) {
    this.opts = opts
  }

  getNodeEnv() {
    return process.env.NODE_ENV || 'dev'
  }

  getPackageJSONConfig() {
    var config = {};
    var jsonPath = path.resolve(this.opts.appDir + '/package.json')
    if(fs.existsSync(jsonPath)) {
      try {
        var jsonParsed = JSON.parse(fs.readFileSync(jsonPath))
        if(jsonParsed.config) {
          if(jsonParsed.config[this.getNodeEnv()])
            config = jsonParsed.config[this.getNodeEnv()]
          else
            config = jsonParsed.config
        }
      } catch(e) {
        console.log('Warning: error parsing config file', jsonPath, e)
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