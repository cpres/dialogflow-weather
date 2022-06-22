const functions = require('@google-cloud/functions-framework');
// const {verifyRequestSignature} = require('@slack/events-api');
const axios = require('axios');

const getLocation = async(query) => {
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
const getWeather = async(queryResult, locationData) => {
  // @TODO - use queryResult date-time to get weather for a specific day.
  try {
    const city = queryResult.parameters.address.city
    const {data} = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${locationData.lat}&lon=${locationData.lon}&units=imperial&appid=${process.env.WEATHER_API_KEY}`)
    data.city = city // keep necessary data together
    return data
  } catch (err) {
    console.error(err)
    // @TODO - handle error based on error response
  }
}
/**
 * 
 * @param {obj} weatherObj - openweatherapi response
 */
const formatWeatherResponse = weatherObj => {
  // console.log("Weather returned: ", weatherObj.main, weatherObj.city, weatherObj.weather)
  return `In ${weatherObj.city} today, there will be ${weatherObj.weather[0].main} with a high of ${weatherObj.main.temp_max}&deg; and a low of ${weatherObj.main.temp_min}&deg;`
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
      const noLocationResponse = formatDialogFlowResponse("Please let me know where to look for the weather!")
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