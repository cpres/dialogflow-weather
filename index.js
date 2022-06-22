const functions = require('@google-cloud/functions-framework');
// const {verifyRequestSignature} = require('@slack/events-api');
const axios = require('axios');
const { resolve } = require('path');

const getLocation = query => {
  return new Promise((resolve, reject) => {
    resolve({
      "lat": 51.5073219,
		  "lon": -0.1276474
    })
  });
}
const getWeather = async(query, location) => {
  // axios.get()
  return "80 degrees"
}
functions.http('weatherCheck', async (req, res) => {
  try {
    if (req.method !== 'POST') {
      const error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    // console.log("weather check body: ", req.body)

    if (!req.body.queryResult) {
      const error = new Error('No queryResult found in body.');
      error.code = 400;
      throw error;
    }
    const location = await getLocation(req.body.queryResult);
    const weather = await getWeather(req.body.queryResult, location);
    console.log("Weather returned: ", weather)

    res.json({"fulfillmentMessages": [
      {
        "text": {
          "text": [
            weather
          ]
        }
      }
    ]});

    return Promise.resolve();

  } catch (err) {
    console.error(err);
    res.status(err.code || 500).send(err);
    return Promise.reject(err);
  }
});