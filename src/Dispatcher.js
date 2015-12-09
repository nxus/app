/* 
* @Author: Mike Reich
* @Date:   2015-11-06 07:44:02
* @Last Modified 2015-12-08
*/

'use strict';

import { EventEmitter } from 'events'

/**
 * The core Dispatcher class, which implements promisified 
 * 
 * @extends EventEmitter
 * @example
 * import { Dispatcher } from '@nxus/core'
 * class MyClass extends Dispatcher {
 *   ...
 * }
 */

export default class Dispatcher extends EventEmitter {
  constructor() {
    super()
    this._awaits = []
  }
  
  /**
   * Bind to an event once
   * @param  {string} event The name of the event to bind to 
   * @param  {callable} listener (optional) The handler for the event
   * @return {Promise}       Returns a promise that resolves when the event fires
   */
  once (event, listener) {
    let superOnce = super.once
    if (listener === undefined) {
      listener = () => {};
    }

    return new Promise((resolve, reject) => {
      var fired = false;

      var g = (...args) => {
        this.removeListener(event, g);
        
        if (!fired) {
          fired = true;
          var result = listener.apply(this, args);
          resolve(result);
          return result;
        }
      }
      g.listener = listener;
      this.on.apply(this, [event, g]);
    })
  }

  /**
   * Emits an event, calling all registered handlers.
   * @param  {string} event The name of the event to emit.
   * @return {Promise}       Returns a promise that resolves when all handlers and awaiting promises have completed.
   */
  emit (event) {
    var cb = (...args) => {

      let _handlers = [].concat(super.listeners(event+".before")).concat(super.listeners(event)).concat(super.listeners(event+".after"));
      let _awaits = [].concat(this._awaits[event+".before"]).concat(this._awaits[event]).concat(this._awaits[event+".after"]);

      return Promise.all(_handlers.map((handler) => {
        let ret = handler(...args)
        return Promise.resolve(ret)
      }).concat(_awaits));
    }

    return {
      with: cb
    }
  }
} 
