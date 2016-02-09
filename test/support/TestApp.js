'use strict';

import sinon from 'sinon'
import Promise from 'bluebird'

import { Dispatcher, Module } from '../../'

class TestApp extends Dispatcher {
  constructor() {
    super()
    
    this.log = sinon.spy();
    this.config = {};

    this.on = sinon.spy(this.on);
    this.once = sinon.spy(this.once);
    this.before = sinon.spy(this.before);
    this.after = sinon.spy(this.after);
    this.onceBefore = sinon.spy(this.onceBefore);
    this.onceAfter = sinon.spy(this.onceAfter);

    this._provide = sinon.createStubInstance(Promise);
    this._respond = sinon.createStubInstance(Promise);

    this._get_on = sinon.spy();
    this._get_once = sinon.spy();
    this._get_request = sinon.stub().returns(this._respond);
    this._get_provide = sinon.stub().returns(this._provide);

    this._get = {
      gather: sinon.stub().returnsThis(),
      respond: sinon.stub().returnsThis(),
      on: sinon.stub().returns(this._get_on),
      once: sinon.stub().returns(this._get_once),
      request: sinon.stub().returns(this._get_request),
      provide: sinon.stub().returns(this._get_provide),
      use: (i) => {
        let m = new Module(this)
        return m.use.call(this._get, i)
      }
    };
    this.get = sinon.stub().returns(this._get);
  }

  launch() {
    return new Promise.mapSeries(['init', 'load', 'startup', 'launch'], (e) => {
      return this.emit(e)
    })
  }

}

export default TestApp;
