/*
* @Author: Mike Reich
* @Date:   2015-11-22 13:06:39
* @Last Modified 2016-09-06
*/

'use strict';

import _ from 'underscore'

import Dispatcher from './Dispatcher'

import ProxyMethods from './ProxyMethods'

/**
 * @private
 * The core ModuleProxy class. This provides a messaging proxy layer between modules and calling code.
 * The main advantage of this proxy class is that missing modules won't cause exceptions in the code.
 *
 * Modules are accessed through the Application.get() method
 *
 * ## Examples
 *
 * Producer modules should register themselves with the use() method, and define gather() and respond() handlers:
 *
 *     app.get('router').use(this).gather('route')
 *     app.get('templater').use(this).respond('template')
 *
 * Consumer modules should get the module they need to use and call provide or request
 *
 *     app.get('router').provide('route', ...)
 *     app.get('templater').request('render', ...)
 *
 * Modules proxy event names as methods to provide/request, so these are synomymous with above:
 *
 *     app.get('router').route(...)
 *     app.get('templater').render(...)
 *
 * Default implementations should be indicated by using default() to occur before provide()
 * Overriding another implementation can use replace() to occur after provide()
 *
 *     app.get('router').default('route', GET', '/', ...)
 *     app.get('router').replace('route', GET', '/', ...)
 *
 * Provide, default, and replace all return a proxy object if called with no arguments, so these are synonymous with above:
 *
 *     app.get('router').default().route('GET', '/', ...)
 *     app.get('router').replace().route('GET', '/', ...)
 *
 */
class ModuleProxy extends Dispatcher {

  constructor(app, name) {
    super()
    this._app = app;
    this._name = name;
    this.loaded = false
    app.on('stop', ::this._onStop)
    app.on('load.before', ::this._beforeLoad)
    this._requestedEvents = {}
    this._registeredEvents = {}
    this._instance = null
  }

  _onStop() {
    this.removeAllListeners()
    this.loaded = false
  }

  _beforeLoad() {
    this.loaded = true
  }

  deregister() {
    this._app.removeListener('stop', ::this._onStop)
    this._app.removeListener('load.before', ::this._beforeLoad)
  }

  /**
   * Let another instance use this module's events to reduce boilerplate calls
   * @ params {object} instance The instance to copy methods to
   */

  use(instance) {
    if(!instance) return instance
    this._instance = instance
    let names = ['emit', 'provide', 'request', 'provideBefore', 'provideAfter', 'default', 'replace']
    let handlerNames = ['on', 'once', 'gather', 'respond', 'before', 'after', 'onceBefore', 'onceAfter']

    let ignoredMethods = ['constructor', 'deregister']
    
    let recurseClassMethodsToProxy = (obj) => {
      if(!obj || obj === Object.prototype || Object.getPrototypeOf(obj) === Object.prototype) return []
      let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
        .map((prop) => {
          return (!ignoredMethods.includes(prop) && instance[prop].bind && prop[0] != "_") ? prop : null
        })
        .filter(p => p)

      methods = methods.concat(recurseClassMethodsToProxy(Object.getPrototypeOf(obj)))
      return methods
    }

    let methods = _.unique(recurseClassMethodsToProxy(instance).reverse())

    for (let name of names) {
      if (this[name] === undefined) continue
      if(this._requestedEvents) this._requestedEvents[name] = true
      instance[name] = this[name].bind(this)
    }
    for (let method of methods) {
      this.gather(method, ::instance[method])
    }
    for (let name of handlerNames) {
      if (this[name] === undefined) continue
      if(this._requestedEvents) this._requestedEvents[name] = true
      instance[name] = (event, handler) => {
        if (handler === undefined) {
          if (instance[event].bind === undefined) {
            this._app.log.error("Module", this._name, "tried to register", event, "without a handler, and does not define a method with that name")
          } else {
            handler = instance[event].bind(instance)
          }
        }
        this[name](event, handler)
        return instance
      }
    }
    return instance
  }

  _provide(myself, when, name, ...args) {
    if (name === undefined) {
      return ProxyMethods(() => { return this.__proxyLess }, myself)()
    }
    if(this._instance && !this._registeredEvents[name]) throw new Error('Requested event '+name+' which doesn\'t exist on target '+this._name)

    if(!this.loaded) {
      return this._app[when]('load', () => {
        return this.emit(name, ...args);
      });
    } else {
      return this.emit(name, ...args);
    }
  }

  /**
   * Provide default arguments to a delayed gather() call, before other provides
   *
   * @param  {string} name The name of the gather event
   * @param  {...*}   args Arguments to provide to the gather event
   * @return {Promise} Resolves when the event is eventually handled
   */
  default(name, ...args) {
    return this._provide('default', 'onceBefore', name, ...args)
  }

  provideBefore(name, ...args) {
    return this.default(name, ...args)
  }


  /**
   * Provide arguments to a delayed gather() call.
   *
   * @param  {string} name The name of the gather event
   * @param  {...*}   args Arguments to provide to the gather event
   * @return {Promise} Resolves when the event is eventually handled
   */
  provide(name, ...args) {
    return this._provide('provide', 'once', name, ...args)
  }

    /**
   * Provide a replacement for a delayed gather() call (after others are provided)
   *
   * @param  {string} name The name of the gather event
   * @param  {...*}   args Arguments to provide to the gather event
   * @return {Promise} Resolves when the event is eventually handled
   */
  replace(name, ...args) {
    return this._provide('replace', 'onceAfter', name, ...args)
  }

  provideAfter(name, ...args) {
    return this.replace(name, ...args)
  }


  /**
   * Receive arguments provided to a delayed gather() call.
   *
   * @param  {string}   name The name of the gather event
   * @param  {callable} handler The handler for each provided value
   */
  gather(name, handler) {
    if (_.isEmpty(this._registeredEvents)) {
      this._app.emit('registeredModule', this._name)
    }
    this.on(name, handler);
    this._registeredEvents[name] = true
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

export default ProxyMethods((...args) => {return new ModuleProxy(...args)})
