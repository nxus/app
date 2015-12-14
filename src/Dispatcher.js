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
   * @param  {callable} [listener] The handler for the event
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
   * Bind to before an event. Receives the event arguments, should return 
   *  modified arguments or nothing.
   * @param  {string} event The name of the event to bind to 
   * @param  {callable} listener The before handler for the event
   */
  before (event, listener) {
    return this.on(event+".before", listener);
  }

  /**
   * Bind to after an event. Receives the event handlers results, should return 
   *  modified results or nothing.
   * @param  {string} event The name of the event to bind to 
   * @param  {callable} listener The after handler for the event
   */
  after (event, listener) {
    return this.on(event+".after", listener);
  }

  /**
   * Bind once to before an event. Receives the event arguments, should return 
   *  modified arguments or nothing.
   * @param  {string} event The name of the event to bind to 
   * @param  {callable} listener The before handler for the event
   * @return {Promise}       Returns a promise that resolves when the event fires
   */
  onceBefore (event, listener) {
    return this.once(event+".before", listener);
  }

  /**
   * Bind once to after an event. Receives the event handlers results, should return 
   *  modified results or nothing.
   * @param  {string} event The name of the event to bind to 
   * @param  {callable} listener The after handler for the event
   * @return {Promise}       Returns a promise that resolves when the event fires
   */
  onceAfter (event, listener) {
    return this.once(event+".after", listener);
  }
  
  /**
   * Emits an event, calling all registered handlers.
   * @param  {string} event The name of the event to emit.
   * @param  {...*}   args  Arguments to the event handlers
   * @return {Promise}       Returns a promise that resolves when all handlers have completed, with any returned results as an array.
   */
  emit (event, ...args) {

    let waterfaller = (prev, curr) => {
      // Need to resolve internally so that we can allow observing-only handlers
      //  that don't return anything, even from their promise.
      return Promise.resolve(curr(prev)).then((_args) => { return _args || prev });
    }

    return Promise.reduce(super.listeners(event+".before"), waterfaller, args)
      .then((newArgs) => {
        return Promise.all(super.listeners(event).map((handler) => {
          let ret = handler(...newArgs)
          return Promise.resolve(ret)
        }));
      })
      .then((results) => {
        return Promise.reduce(super.listeners(event+".after"), waterfaller, results);
      });
  }
} 
