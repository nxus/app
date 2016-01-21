/* 
* @Author: mike
* @Date:   2015-05-18 17:04:13
* @Last Modified 2016-01-20
* @Last Modified time: 2016-01-20 20:17:19
*/

'use strict';

import fs from 'fs'
import _ from 'underscore'
import path from 'path'

/**
 * ConfigurationManager loads the internal app.config hash using the following order (each overwrites any values of the previous):
 * 1. Opts loaded into the application object.
 * 2. Opts in the `config` hash of the project package.json file
 * 3. Any environment variables
 */
class ConfigurationManager {

  constructor(opts = {}) {
    this.opts = opts
  }

  /**
   * Returns the current NODE_ENV
   * @return {string} the current NODE_ENV
   */
  getNodeEnv() {
    return process.env.NODE_ENV || 'dev'
  }

  /**
   * Gets the local package.json file and tries to find an internal `config` key
   * @return {object} the intenral `config` object or an empty object if it isn't defined.
   */
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

  /**
   * Extracts the currently avaiable environment variables
   * @return {object} A hash of the current environment variables
   */
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

  /**
   * Returns the final config option using the loading order described above.
   * @return {object} the final composed configuration object.
   */
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