/* 
* @Author: mike
* @Date:   2015-05-18 16:56:47
* @Last Modified 2015-07-16
* @Last Modified time: 2015-07-16 15:05:05
*/

require("babel").transform("code", { optional: ["runtime"] });

module.exports = require('./lib/Application')