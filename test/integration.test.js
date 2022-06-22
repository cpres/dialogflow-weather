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
  it('returns weather results', async () => {
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



//   it('handles non-existent query', async () => {
//     const query = 'g1bb3r1shhhhhhh';

//     const server = functionsFramework.getTestServer('weatherCheck');
//     const response = await supertest(server)
//       .post('/')
//       .send({text: query})
//       .expect(200);

//     const result = response.body;
//     assert.ok(result);

//     // const result = results[0];
//     // assert.ok(result);
//     // assert.ok(result.text);
//     // assert.ok(result.text.includes('No results'));
//   });

  it('handles empty query', async () => {
    const query = '';

    const server = functionsFramework.getTestServer('weatherCheck');
    await supertest(server)
      .post('/')
      .send({})
      .expect(400);
  });

});
