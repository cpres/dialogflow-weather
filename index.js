const functions = require('@google-cloud/functions-framework');
// const {verifyRequestSignature} = require('@slack/events-api');
const axios = require('axios');

const getLocation = async(query) => {
  // Zip codes are better than cities as you will get more localized results, so we start there
  if (query.parameters.address['zip-code'] !== '') {
    return {zip: query.parameters.address['zip-code']}
  }
  const city = (query.parameters.address.city) ? query.parameters.address.city : false
  if (!city) {
    return false
  }

  try {
    const {data} = await axios.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.WEATHER_API_KEY}`)
    if (data[0].lat && data[0].lon) {
      return data[0]
    } else {
      return false
    }
  } catch (err) {
    console.error(err)
  }
}


/**
 * 
 * @param {obj} queryResult - dialogflow's queryResult
 * @param {obj} locationData - either an openweatherapi response or else just a zip
 * @returns 
 */
const getWeather = async(queryResult, locationData) => {
  // @TODO - use queryResult date-time to get weather for a specific day.
  try {
    const weatherParams = (locationData.zip) ? `zip=${locationData.zip}` : `lat=${locationData.lat}&lon=${locationData.lon}`
    const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/weather?${weatherParams}&units=imperial&appid=${process.env.WEATHER_API_KEY}`)
    data.city = (queryResult.parameters.address.city) ? queryResult.parameters.address.city : data.name
    return data
  } catch (err) {
    console.error(err)
    // @TODO - handle error based on error response
  }
}


/**
 * formatWeatherResponse
 * This is what we'll respond as human friendly text for the chat bot.
 * @param {obj} weatherObj - openweatherapi response with city added.
 */
const formatWeatherResponse = weatherObj => {
  return `In ${weatherObj.city} today, there will be ${weatherObj.weather[0].description} with a high of ${weatherObj.main.temp_max}° and a low of ${weatherObj.main.temp_min}°`
}


/**
 * formatDialogFlowResponse
 * Initially handling a single response message back to Dialogflow
 * @param {@str} body - the message to be sent
 */
const formatDialogFlowResponse = (body) => {
  return {"fulfillmentMessages": [
    {
      "text": {
        "text": [
          body
        ]
      }
    }
  ]}
}

functions.http('weatherCheck', async (req, res) => {
  try {
    if (req.method !== 'POST') {
      const error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    if (!req.body.queryResult) {
      const error = new Error('No queryResult found in body.');
      error.code = 400;
      throw error;
    }
    const location = await getLocation(req.body.queryResult);
    if (!location) {
      const noLocationResponse = formatDialogFlowResponse("I would love to help, I just need to know where to look for the weather! :)")
      res.json(noLocationResponse)
      return Promise.resolve();
    }
    const weatherObj = await getWeather(req.body.queryResult, location);

    const weatherResp = formatWeatherResponse(weatherObj)

    res.json(formatDialogFlowResponse(weatherResp));

    return Promise.resolve();

  } catch (err) {
    console.error(err);
    res.status(err.code || 500).send(err);
    return Promise.reject(err);
  }
});