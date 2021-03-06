var Alexa = require('alexa-sdk');
var express = require('express');
var request = require('request');

var app = express();

var ForecastIo_API_Key = "9e0495a835ed823a705a9a567eee982a";

var APP_ID = "amzn1.ask.skill.ace3ff90-08a7-4068-ba61-dda0dde6f736";
var SKILL_NAME = 'Weather Companion';
var HELP_MESSAGE = 'You can ask a dressing advice for today or tomorrow. Which will it be?';
var HELP_REPROMPT = 'What can I help you with?';
var STOP_MESSAGE = 'Goodbye!';

//Google Analytics
var GA_TRACKING_ID = 'UA-112014818-1';

//Dressing advice
var SunnyUnderTen = 'It will be sunny and cold outside; Dress warm and carry your sunglasses.';
var SunnyTenToTwenty = 'Sun will be shining bright; Remember to bring sunglasses with you.';
var SunnyAboveTwenty = 'You are lucky! Lovely sunshine and warm temperatures are expected; Dress light and take your sunglasses.';
var CloudyUnderTen = 'Bad day; It will be cold and cloudy, dress warm!';
var CloudyTenToTwenty = 'It is going to be cloudy but temperatures will be ok; Keep it casual!';
var CloudyAboveTwenty = 'It could be worse; Clouds are expected but it going to be hot, so dress light.';
var RainUnderTen = 'Ouch! Weather is not on your side. Dress warm and bring your umbrella.';
var RainTenToTwenty = 'Classic Paris; It is going to rain so remember to carry your umbrella.';
var RainAboveTwenty = 'Expect rain and hot temperatures. I recommend dressing light but bringing an umbrella';
var SnowUnderTen = 'Oh Oh Oh! Winter is here, and with it comes the snow. You should be dressing warm.';
var SnowTenToTwenty = 'We might be having snow, but it is not going to be that cold. I still recommend dressing warm.';

function trackEvent(category, action, label, value, cb) {
  console.log(1);
  var data = {
    v: '1', // API Version.
    tid: GA_TRACKING_ID,
    cid: '555',
    t: 'event',
    ec: category,
    ea: action,
    el: label,
    ev: value,
  };
  request.post(
    'http://www.google-analytics.com/collect', {
      form: data
    },
    function(err, response) {
      console.log(2);
      if (err) { console.log(3); return cb(err); }
      if (response.statusCode !== 200) {
        console.log(4);
        return cb(new Error('Tracking failed'));
      }
      console.log(5);
      cb();
    }
  );
}

function separateStringBySpace(string) {
  return string.replace("-", " ");
}

function getDressingAdvice(forecast, today) {
  var advice = "";
  var forecastData;
  if (today) {
    forecastData = forecast["daily"]["data"][0];
  } else {
    forecastData = forecast["daily"]["data"][1];
  }
  var icon = forecastData["icon"];
  console.log(icon);
  var averageTemperature = ((forecastData["temperatureMin"]) + (forecastData["temperatureMax"])) / 2;
  console.log(averageTemperature);

  if ((icon === "clear-day" && averageTemperature < 10)
   || (icon === "clear-night" && averageTemperature < 10)) {
      console.log(1);
      advice = SunnyUnderTen;
  } else if ((icon === "clear-day" && 10 <= averageTemperature < 20)
   || (icon === "clear-night" && 10 <= averageTemperature < 20)) {
      console.log(2);
      advice = SunnyTenToTwenty;
  } else if ((icon === "clear-day" && averageTemperature >= 20)
   || (icon === "clear-night" && averageTemperature >= 20)) {
      console.log(3);
      advice = SunnyAboveTwenty;
  } else if (icon === "rain" && averageTemperature < 10) {
     console.log(4);
      advice = RainUnderTen;
  } else if (icon === "rain" && 10 <= averageTemperature < 20) {
     console.log(5);
      advice = RainTenToTwenty;
  } else if (icon === "rain" && averageTemperature >= 20) {
     console.log(6);
      advice = RainAboveTwenty;
  } else if ((icon === "snow" && averageTemperature < 10)
   || (icon === "sleet" && averageTemperature < 10)) {
      console.log(7);
      advice = SnowUnderTen;
  } else if ((icon === "snow" && 10 <= averageTemperature < 20)
   || (icon === "sleet" && 10 <= averageTemperature < 20)) {
      console.log(8);
      advice = SnowTenToTwenty;
  } else if ((icon === "wind" && averageTemperature < 10)
   || (icon === "fog" && averageTemperature < 10)
   || (icon === "cloudy" && averageTemperature < 10)
   || (icon === "partly-cloudy-day" && averageTemperature < 10)
   || (icon === "partly-cloudy-night" && averageTemperature < 10)) {
      console.log(9);
      advice = CloudyUnderTen;
  } else if ((icon === "wind" && 10 <= averageTemperature < 20)
   || (icon === "fog" && 10 <= averageTemperature < 20)
   || (icon === "cloudy" && 10 <= averageTemperature < 20)
   || (icon === "partly-cloudy-day" && 10 <= averageTemperature < 20)
   || (icon === "partly-cloudy-night" && 10 <= averageTemperature < 20)) {
      console.log(10);
      advice = CloudyTenToTwenty;
  } else if ((icon === "wind" && averageTemperature >= 20)
   || (icon === "fog" && averageTemperature >= 20)
   || (icon === "cloudy" && averageTemperature >= 20)
   || (icon === "partly-cloudy-day" && averageTemperature >= 20)
   || (icon === "partly-cloudy-night" && averageTemperature >= 20)) {
      console.log(11);
      advice = CloudyAboveTwenty;
  } else {
     console.log(12);
      advice = separateStringBySpace(icon) + "is expected, with an average temperature of " + averageTemperature + " Celsius degrees";
  }
  return advice;
}


var http = require('https');

function getJSON(url, callback) {
  http.request(url, function(response) {
    var body = "";
    response.on('data', function(chunk) {
      body += chunk; //appens every chunck of data to body as soon as it is received
    });
    response.on('end', function() {
      var forecast = JSON.parse(body); //full response is received
      callback(null, forecast);
    });
    response.on('error', callback); // handling errors
  }).on('error', callback).end();
}


exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


var handlers = {
    'LaunchRequest': function (intent, session, response) {
      var self = this;

      var callback = function(err) {
        if (err) { return next(err); }
        self.emit('AMAZON.HelpIntent');
      };
      trackEvent('Intent', 'LaunchRequest', 'Launch', '100', callback());
    },
    'AMAZON.CancelIntent': function (intent, session, response) {
      var self = this;

      var callback = function(err) {
        if (err) { return next(err); }
        console.log(STOP_MESSAGE);
        self.response.speak(STOP_MESSAGE);
        self.emit(':responseReady');
      };
      trackEvent('Intent', 'AMAZON.CancelIntent', 'Cancel', '100', callback());
    },
    'AMAZON.HelpIntent': function (intent, session, response) {
      var speechOutput = HELP_MESSAGE;
      var reprompt = HELP_REPROMPT;
      var self = this;

      var callback = function(err) {
        if (err) { return next(err); }
        self.response.speak(speechOutput).listen(reprompt);
        self.emit(':responseReady');
      };
      trackEvent('Intent', 'AMAZON.HelpIntent', 'Help', '100', callback());
    },
    'AMAZON.StopIntent': function (intent, session, response) {
      var self = this;

      var callback = function(err) {
        if (err) { return next(err); }
        console.log(STOP_MESSAGE);
        self.response.speak(STOP_MESSAGE);
        self.emit(':responseReady');
      };
      trackEvent('Intent', 'AMAZON.StopIntent', 'Stop', '100', callback());
    },
    'DressingTodayIntent': function(intent, session, response) {
      var speechOutput;
      var self = this;
      var callback = getJSON('https://api.darksky.net/forecast/9e0495a835ed823a705a9a567eee982a/48.861317,2.348764?units=si&exclude=currently,minutely,hourly,alerts,flags',
        function(err, forecast) {
          if (err) {
            console.log('Error occurred while trying to retrieve weather data', err);
          } else {
            speechOutput = getDressingAdvice(forecast, true);
            console.log("one: " + speechOutput);
          }
          console.log("two: " + speechOutput);
          self.response.cardRenderer("Your dressing advice for today:", speechOutput);
          self.response.speak(speechOutput);
          self.emit(':responseReady');
        });
      trackEvent('Intent', 'DressingTodayIntent', 'DressingToday', '100', callback);
    },
    'DressingTomorrowIntent': function(intent, session, response) {
      var speechOutput;
      var self = this;
      var callback = getJSON('https://api.darksky.net/forecast/9e0495a835ed823a705a9a567eee982a/48.861317,2.348764?units=si&exclude=currently,minutely,hourly,alerts,flags',
        function(err, forecast) {
          if (err) {
              console.log('Error occurred while trying to retrieve weather data', err);
          } else {
              speechOutput = getDressingAdvice(forecast, false);
              console.log("one: " + speechOutput);
          }
          console.log("two: " + speechOutput);
          self.response.cardRenderer("Your dressing advice for tomorrow:", speechOutput);
          self.response.speak(speechOutput);
          self.emit(':responseReady');
        });
      trackEvent('Intent', 'DressingTomorrowIntent', 'DressingTomorrow', '100', callback);
    },
};
