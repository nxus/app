/* 
* @Author: Mike Reich
* @Date:   2016-02-09 10:57:28
* @Last Modified 2016-02-09
*/

'use strict';

import Winston from 'winston'

export default () => {
  var t = new Winston.transports.Console({
    level: 'debug',
    timestamp: true,
    prettyPrint: true,
    colorize: 'all',
    depth: 6
  })

  return new Winston.Logger({
    exitOnError: false,
    transports: [t]
  })
}