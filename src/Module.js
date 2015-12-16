/* 
* @Author: Mike Reich
* @Date:   2015-11-22 13:06:39
* @Last Modified 2015-12-15
*/

'use strict';

import Dispatcher from './Dispatcher'

export default class Module extends Dispatcher {

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
    return this.on(name, handler);
  }

  /**
   * Request the result of processing a named event
   *  
   * @param  {string}   name The name of the request event
   * @param  {...*}   args Arguments to provide to the responder
   * @return {Promise} Resolves to the result of the event's handler
   */  
  request(name, ...args) {
    return this.emit(name, ...args);
  }

  /**
   * Respond to a named event
   *  
   * @param  {string}   name The name of the request event
   * @param  {callable} handler The handler for the request
   */  
  respond(name, handler) {
    this.after(name, (results) => {
      if (results.length == 1) {
        return results[0]
      }
      return results;
    });
    return this.on(name, handler);
  }
}
