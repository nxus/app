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
   * @return {Promise}       Returns a promise that resolves when all handlers have completed.
   */
  emit (event) {

    let waterfaller = (prev, curr) => {
      // Need to resolve internally so that we can allow observing-only handlers
      //  that don't return anything, even from their promise.
      return Promise.resolve(curr(prev)).then((_args) => { return _args || prev });
    }

    var cb = (...args) => {
      return Promise.reduce(super.listeners(event+".before"), waterfaller, args)
        .then((newArgs) => {
          return Promise.all(super.listeners(event).map((handler) => {
            let ret = handler(...newArgs)
            return Promise.resolve(ret)
          }));
        })
        .then((results) => {
          return Promise.reduce(super.listeners(event+".after"), waterfaller, results);
        })
    }

    return {
      with: cb
    }
  }
} 
