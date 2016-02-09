/* 
* @Author: Mike Reich
* @Date:   2015-11-22 13:06:39
* @Last Modified 2016-02-08
*/

'use strict';

import Dispatcher from './Dispatcher'

import ProxyMethods from './ProxyMethods'

/**
 * The core Module class. This provides a messaging proxy layer between modules and calling code.
 * The main advantage of this proxy class is that missing modules won't cause exceptions in the code.
 *
 * Modules are accessed through the Application.get() method
 *
 * @example
 * let router = app.get('router')
 * 
 */
class Module extends Dispatcher {

  constructor(app, name) {
    super()
    this._app = app;
    this._name = name;
    this.loaded = false
    app.on('stop', this.removeAllListeners.bind(this));
    this._app.onceBefore('load').then(() => {
      this.loaded = true
    })
  }

  /**
   * Let another instance use this module's events to reduce boilerplate calls
   * @ params {object} instance The instance to copy methods to
   */

  use(instance) {
    let names = ['emit', 'provide', 'request', 'provideBefore', 'provideAfter']
    let handler_names = ['on', 'once', 'gather', 'respond', 'before', 'after', 'onceBefore', 'onceAfter']
    for (let name of names) {
      if (this[name] === undefined) continue
      instance[name] = this[name].bind(this)
    }
    for (let name of handler_names) {
      if (this[name] === undefined) continue
      instance[name] = (event, handler) => {
        if (handler === undefined) {
          handler = instance[event].bind(instance)
        }
        this[name](event, handler)
        return instance
      }
    }
    return instance
  }

  /**
   * Provide arguments to a delayed gather() call, but do it before the other provide() calls.
   *  
   * @param  {string} name The name of the gather event
   * @param  {...*}   args Arguments to provide to the gather event
   * @return {Promise} Resolves when the event is eventually handled
   */  
  provideBefore(name, ...args) {
    if(!this.loaded)
      return this._app.onceAfter('init').then(() => {
        return this.emit(name, ...args);
      });
    else
      return this.emit(name, ...args);
  }

  /**
   * Provide arguments to a delayed gather() call.
   *  
   * @param  {string} name The name of the gather event
   * @param  {...*}   args Arguments to provide to the gather event
   * @return {Promise} Resolves when the event is eventually handled
   */  
  provide(name, ...args) {
    if(!this.loaded)
      return this._app.onceBefore('load').then(() => {
        return this.emit(name, ...args);
      });
    else
      return this.emit(name, ...args);
  }

    /**
   * Provide arguments to a delayed gather() call, after the main provide() calls.
   *  
   * @param  {string} name The name of the gather event
   * @param  {...*}   args Arguments to provide to the gather event
   * @return {Promise} Resolves when the event is eventually handled
   */  
  provideAfter(name, ...args) {
    if(!this.loaded)
      return this._app.onceAfter('load').then(() => {
        return this.emit(name, ...args);
      });
    else
      return this.emit(name, ...args);
  }
  
  
  /**
   * Receive arguments provided to a delayed gather() call.
   *  
   * @param  {string}   name The name of the gather event
   * @param  {callable} handler The handler for each provided value
   */  
  gather(name, handler) {
    this.after(name, (results) => {
      if (results.length == 1) {
        return results[0]
      }
      return results;
    });
    this.on(name, handler);
    return this;
  }

  /**
   * Request the result of processing a named event
   *  
   * @param  {string}   name The name of the request event
   * @param  {...*}   args Arguments to provide to the responder
   * @return {Promise} Resolves to the result of the event's handler
   */  
  request(name, ...args) {
    return this.provide(name, ...args);
  }

  /**
   * Respond to a named event
   *  
   * @param  {string}   name The name of the request event
   * @param  {callable} handler The handler for the request
   */  
  respond(name, handler) {
    return this.gather(name, handler);
  }
}

export default ProxyMethods((...args) => {return new Module(...args)})
