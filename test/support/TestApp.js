'use strict';

import _ from 'underscore'
import sinon from 'sinon'
import Promise from 'bluebird'

import { Dispatcher, Module, ProxyMethods } from '../../'

const stubPromise = sinon.createStubInstance(Promise)

class TestApp extends Dispatcher {
  constructor() {
    super()

    this.log = sinon.spy();
    this.log.debug = sinon.spy();
    this.log.info = sinon.spy();
    this.log.error = sinon.spy();
    this.config = {};
    this.writeDefaultConfig = sinon.spy();

    this.on = sinon.spy(this.on);
    this.once = sinon.spy(this.once);
    this.before = sinon.spy(this.before);
    this.after = sinon.spy(this.after);
    this.onceBefore = sinon.spy(this.onceBefore);
    this.onceAfter = sinon.spy(this.onceAfter);

    this._request = sinon.stub().returns(stubPromise)
    this._provide = sinon.stub().returns(stubPromise)
    this._replace = sinon.stub().returns(stubPromise)
    this._default = sinon.stub().returns(stubPromise)

    this._get_on = sinon.spy();
    this._get_emit = sinon.spy(function(event, ...args) {return Promise.resolve(...args)})
    this._get_once = sinon.spy();
    this._get_gather = sinon.stub().returnsThis();
    this._get_respond = sinon.stub().returnsThis();
    this._get_default = sinon.stub().returnsThis();
    this._get_replace = sinon.stub().returnsThis();

    let handler = function(next) {
      return function(name, h) {
        if (h == undefined) {
          throw "Handler does not exist for "+name
        }
        return next(name, h)
      }
    }
    this._get = {
      gather: this._get_gather,
      respond: this._get_respond,
      on: sinon.stub().returns(this._get_on),
      emit: this._get_emit,
      once: sinon.stub().returns(this._get_once),
      request: this._request,
      provide: this._replace,
      provideAfter: this._replace,
      provideBefore: this._default,
      default: this._default,
      replace: this._replace,
      use: (i) => {
        let m = new Module(this)
        let useme = _.extend(_.clone(this._get), {gather: handler(this._get_gather), respond: handler(this._get_respond)})
        return m.use.call(useme, i)
      }
    }
    this.get = sinon.stub().returns(ProxyMethods(() => {return this._get})());
    this._request.withArgs().returns(this.get())
    this._provide.withArgs().returns(this.get())
    this._default.withArgs().returns(this.get())
    this._replace.withArgs().returns(this.get())

  }

  launch() {
    return new Promise.mapSeries(['init', 'load', 'startup', 'launch'], (e) => {
      return this.emit(e)
    })
  }

}

export default TestApp;
