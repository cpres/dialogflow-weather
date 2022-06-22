# Cameron's Slack Bot!
For this web service integration with Openweather and Slack I decided a simple cloud function was the best for the task. The weather bot will be a sporadically used service, so keeping the lights on all the time is wasteful in this case. There is also not an existing service with Openweather integration to tie into, nor do I imagine a use case for that in the future so a stand-alone entity that spins up only when needed was the strategy I have implemented.

## Bot Architecture
I have decided to use this opportunity to learn DialogFlow from Google! It has a neato integration with Slack (almost somewhat clunky), and makes for a much more seamless and conversational bot experience. This means the expected data input to this service will be the Raw JSON output of DialogFlow. We can extract city and date from the DialogFlow conversation for the purpose of weather check and response to Slack user.

* [DialogFlow and Slack Documentation on GCP][slackdoc]

[slackdoc]: https://cloud.google.com/dialogflow/es/docs/integrations/slack

## Deploy and run this cloud function
Currently this is being run in Cameron's personal GCP project so deploying by anyone else won't be possible. For ease of Cameron's deploying though:

    yarn deploy

# Run the tests
In order to run the tests you will need to get an OpenWeather API token into your environment. Consider creating a test.sh file with "export API_KEY={openweather key}"

    yarn test