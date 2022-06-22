// Copyright 2022 Google LLC
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

const assert = require('assert');
const testData = require('./dialogflow.json')
const supertest = require('supertest');
const functionsFramework = require('@google-cloud/functions-framework/testing');

require('../index');

describe('functions_slack_format functions_slack_request functions_slack_search functions_verify_webhook', () => {
  // process.env.WEATHER_API_KEY = WEATHER_API_KEY;
  it('it handles city weather results', async () => {
    const server = functionsFramework.getTestServer('weatherCheck');
    const response = await supertest(server)
      .post('/')
      .send(testData)
      .expect(200);
      // console.log("response 1: ", response.body.fulfillmentMessages)

    const results = response.body && response.body.fulfillmentMessages;
    const result = results[0];
    assert.ok(result);
    assert.ok(response.body);
    assert.ok(result.text.text[0].indexOf('Tokyo') > -1);
  });

  it('it handles zip code weather results', async () => {
    const server = functionsFramework.getTestServer('weatherCheck');
    let tempData = testData
    tempData.queryResult.parameters.address.city = '';
    tempData.queryResult.parameters.address['zip-code'] = "94606"
    const response = await supertest(server)
      .post('/')
      .send(tempData)
      .expect(200);

    const results = response.body && response.body.fulfillmentMessages;
    const result = results[0];
    assert.ok(result);
    assert.ok(response.body);
    assert.ok(result.text.text[0].indexOf('Oakland') > -1);
  });

  it('handles empty query', async () => {
    const server = functionsFramework.getTestServer('weatherCheck');
    await supertest(server)
      .post('/')
      .send({})
      .expect(400);
  });

});
