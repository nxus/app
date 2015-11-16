/* 
* @Author: Mike Reich
* @Date:   2015-11-06 07:44:02
* @Last Modified 2015-11-06
*/

'use strict';

import { EventEmitter } from 'events'

class Dispatcher extends EventEmitter {

  constructor () {
    super()
    this._events = []
    this._registered = [];

    this.on('newListener', (event, listener) => {
      this._events.push(event);
    })
  }

  register(callback) {
    this._registered.push(callback);
  }

  /*
    Application overrides EventEmitter's `emit` function to provide simple event
    handler ordering with `.before` and `.after` suffixes indicating that the 
    handlers should be called before or after handlers for the event with no 
    suffix
    
    For example, the following prints 1, 2, and 3 in order: 
    
    ```
    app.on('print.before', (n) => { console.log(n) })
    app.on('print', (n) => { console.log(n+1) })
    app.on('print.after', (n) => { console.log(n+2) })
    
    app.emit('print', 1)
    ```
   */
  emit() {
    try {
      if (arguments[0] == "newListener") return super.emit.apply(this, arguments)

      var args = Array.prototype.slice.call(arguments)
      var beforeArgs = Array.prototype.slice.call(arguments)
      beforeArgs[0] = beforeArgs[0]+".before"
      var afterArgs = Array.prototype.slice.call(arguments)
      afterArgs[0] = afterArgs[0]+".after"

      super.once.apply(this, [beforeArgs[0], ((a) => {
        return () => {super.emit.apply(this, a)}
      })(args)])

      super.once.apply(this, [arguments[0], ((a) => {
        return () => {
          this._registered.forEach((cb) => {
            cb(arguments);
          });
          super.emit.apply(this, a)
        }
      })(afterArgs)])

      super.emit.apply(this, beforeArgs)
    } catch (e) {
      var logger = console
      if (this.log && this.log.error) logger = this.log
      logger.error("Exception processing event: " + arguments[0], e.stack, e)
    }
  }
}

export default Dispatcher
