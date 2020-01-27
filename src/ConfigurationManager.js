/* 
* @Author: mike
* @Date:   2015-05-18 17:04:13
* @Last Modified 2016-08-25
* @Last Modified time: 2016-08-25 10:27:07
*/

'use strict';

import fs from 'fs'
import _ from 'underscore'
import path from 'path'
import rc from 'rc'
import json5 from 'json5'
/**
 * @private
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
    return this.opts.env || process.env.NODE_ENV || 'dev'
  }

  /**
   * @private
   * Gets the local package.json file and tries to find an internal `config` key
   * @return {object} the intenral `config` object or an empty object if it isn't defined.
   */
  _rcConfig() {
    return rc(this.opts.namespace, {}, {config: this.opts.config}, json5.parse)
  }

  /**
   * Extracts the currently avaiable environment variables
   * @return {object} A hash of the current environment variables
   */
  getEnvironmentVariables() {
    return process.env
  }

  /**
   * Returns the final config option using the loading order described above.
   * @return {object} the final composed configuration object.
   */
  getConfig() {
    return Object.assign(
      // Read the config in the app's package.json
      this._rcConfig(),
      // Environment variables take precedence
      this.getEnvironmentVariables(),
      // but NODE_ENV must be present so, ensure it
      {NODE_ENV: this.getNodeEnv()}
    )
  }
}

module.exports = ConfigurationManager
