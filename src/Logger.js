/* 
* @Author: Mike Reich
* @Date:   2016-02-09 10:57:28
* @Last Modified 2016-08-25
*/

'use strict';

import debug from 'debug-logger'

/**
 * Factory method for instances of the `debug-logger` module.
 * @param  {string} name display name used to identify output from the logger
 * @return {Object} `debug-logger` module instance
 */
const Logger = (name = 'application') => {
  debug.inspectOptions = {
    colors : true
  };
  return debug("nxus:"+name)
} 

const logger = new Logger()

export {Logger as default, logger}