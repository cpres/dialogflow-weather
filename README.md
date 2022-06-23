# Cameron's Weather Bot!
For this web service integration with Openweather into Slack I decided a simple cloud function was the best for the task. The weather bot will be a sporadically used service, so keeping the lights on all the time is wasteful in this case. 

## Bot Architecture
I have decided to use this opportunity to learn DialogFlow from Google! It has a neato integration with Slack (albeit somewhat clunky), and makes for a much more seamless and conversational bot experience. This means the expected data input to this service will be the Raw JSON output of DialogFlow. We can extract city and date from the DialogFlow conversation for the purpose of weather check and response to Slack user.

I purposefully kept Slack out of the code, so this software could be used for any Dialogflow integration needs, just as easily use this in Messenger, Skype, Twilio, Telegram etc...

Why integrate just two services, when you can integrate 3, with easy plug and play for dozens more!

* [DialogFlow and Slack Documentation on GCP][slackdoc]

[slackdoc]: https://cloud.google.com/dialogflow/es/docs/integrations/slack

## Deploy and run this cloud function
Currently this is being run in Cameron's personal GCP project so deploying by anyone else won't be possible. For ease of Cameron's deploying though:

    yarn deploy

# Run the tests
In order to run the tests you will need to be running Node 16, and to have an OpenWeather API token in your environment. This is required for running the integration tests. Consider creating a test.sh file with "export WEATHER_API_KEY={openweather key}"

    yarn test

# Desires for the app:
Add authentication! For rapid-prototyping and considerations with Dialogflow, the v1 is not including authentication, but this is an important element of any web service.

I built a two-step Openweather call, where we can start with getting multiple locations based off a city. The future enhancement is to make an interactive response where the user can pick from an option, or otherwise show multiple location responses, Paris France, as well as Paris Texas, etc... 

Handle images of the weather in the response. We can parse an image url out of open weather responses like this: http://openweathermap.org/img/wn/10d@2x.png

Handle the input of city, state and country. Openweather requires state codes and country codes in a particular ISO format, this is not the format that Dialogflow sends city and state information.

Dialogflow is sending date-time to this app, Using that and we can parse through the time periods that come with openweather, which contains dates in 3 hour windows.

Dialogflow is setup to handle things like weather you should wear a swimsuit, or wear gloves. Adding temperature based logic for clothing items would be a very fun addition to this software's capabilities.