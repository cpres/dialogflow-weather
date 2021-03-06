// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const sinon = require('sinon');
const assert = require('assert');

const {getFunction} = require('@google-cloud/functions-framework/testing');

const method = 'POST';
const query = require('./dialogflow.json');

const getSample = () => {
    const weathercheck = {
        queryResult: {
            parameters: sinon.stub().yields(),
        },
    };

  return {    
    mocks: {
      weathercheck: weathercheck,
    },
  };
};

const getMocks = () => {
  const req = {
    query: {},
    body: {},
    get: function (header) {
      return this.headers[header];
    },
  };
  sinon.spy(req, 'get');
  const res = {
    // headers: {},
    send: sinon.stub().returnsThis(),
    json: sinon.stub().returnsThis(),
    end: sinon.stub().returnsThis(),
    status: function (statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    set: function (header, value) {
      this.headers[header] = value;
      return this;
    },
  };
  sinon.spy(res, 'status');
  sinon.spy(res, 'set');
  return {
    req: req,
    res: res,
  };
};

const stubConsole = function () {
  sinon.stub(console, 'error');
//   sinon.stub(console, 'log');
};

//Restore console
const restoreConsole = function () {
//   console.log.restore();
  console.error.restore();
};
beforeEach(stubConsole);
afterEach(restoreConsole);

describe('functions_weathercheck', () => {
  it('Send fails if not a POST request', async () => {
    const error = new Error('Only POST requests are accepted');
    error.code = 405;
    const mocks = getMocks();

    const weatherCheck = getFunction('weatherCheck');

    try {
      await weatherCheck(mocks.req, mocks.res);
    } catch (err) {
      assert.deepStrictEqual(err, error);
      assert.strictEqual(mocks.res.status.callCount, 1);
      assert.deepStrictEqual(mocks.res.status.firstCall.args, [error.code]);
    }
  });
});


describe('functions_weathercheck functions_verify_webhook', () => {
  it('Handles no location', async () => {
    const mocks = getMocks();
    const sample = getSample();

    mocks.req.method = method;
    mocks.req.body = query;
    mocks.req.body.queryResult.parameters.address.city = '';
    mocks.req.body.queryResult.parameters.address['zip-code'] = '';
    sample.mocks.weathercheck.queryResult.parameters.yields({address: null});

    const weatherCheck = getFunction('weatherCheck');

    await weatherCheck(mocks.req, mocks.res);
    assert.deepStrictEqual(mocks.res.json.firstCall.args, [{"fulfillmentMessages": [
        {
          "text": {
            "text": [
                "I would love to help, I just need to know where to look for the weather! :)"
            ]
          }
        }
      ]}]
    )
  });
});

