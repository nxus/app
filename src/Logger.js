/* 
* @Author: Mike Reich
* @Date:   2016-02-09 10:57:28
* @Last Modified 2016-08-25
*/

'use strict';

import debug from 'debug-logger'

const Logger = (name = 'Application') => {
  debug.inspectOptions = {
    colors : true
  };
  return debug(name)
} 

export default Logger
export var logger = Logger()