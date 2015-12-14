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
    this.before = sinon.spy(this.before);
    this.after = sinon.spy(this.after);
    this.onceBefore = sinon.spy(this.onceBefore);
    this.onceAfter = sinon.spy(this.onceAfter);

    this._gather = sinon.createStubInstance(Promise);
    this._provide_with = sinon.createStubInstance(Promise);
    this._request_with = sinon.createStubInstance(Promise);
    this._respond_with = sinon.createStubInstance(Promise);
    this._get_on = sinon.spy();
    this._get_once = sinon.spy();
    this._get_request = {
      with: sinon.stub().returns(this._request_with)
    }
    this._get_respond = {
      with: sinon.stub().returns(this._respond_with)
    }
    this._provide = {
      with: sinon.stub().returns(this._provide_with)
    }
    this._get = {
      gather: sinon.stub().returns(this._gather),
      provide: sinon.stub().returns(this._send),
      on: sinon.stub().returns(this._get_on),
      once: sinon.stub().returns(this._get_once),
      request: sinon.stub().returns(this._get_request),
      respond: sinon.stub().returns(this._get_respond)
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
