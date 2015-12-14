'use strict';

import sinon from 'sinon'
import Promise from 'bluebird'

import { Dispatcher } from '../../'

class TestApp extends Dispatcher {
  constructor() {
    super()
    
    this.log = sinon.spy();
    this.config = {};

    this.on = sinon.spy(this.on);
    this.once = sinon.spy(this.once);

    this._gather = sinon.createStubInstance(Promise);
    this._send_with = sinon.createStubInstance(Promise);
    this._emit_with = sinon.createStubInstance(Promise);
    this._get_on = sinon.spy();
    this._get_once = sinon.spy();
    this._get_emit = {
      with: sinon.stub().returns(this._emit_with)
    }
    this._send = {
      with: sinon.stub().returns(this._send_with)
    }
    this._get = {
      gather: sinon.stub().returns(this._gather),
      send: sinon.stub().returns(this._send),
      on: sinon.stub().returns(this._get_on),
      once: sinon.stub().returns(this._get_once),
      emit: sinon.stub().returns(this._get_emit)
    };
    this.get = sinon.stub().returns(this._get);

  }

  launch() {
    return new Promise.mapSeries(['init', 'load', 'startup', 'launch'], (e) => {
      return this.emit(e).with();
    })
  }

}

export default TestApp;
