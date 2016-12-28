'use strict'

const request = require('request');
const fbm = require('./messenger-handles');

const weatherAPI = '8ba0a17ada98c62ad89a2f76f571960d'
const location = 'Maynooth,ie'

module.exports = {
  getWeather : (sender,user) => {
    let url = 'http://api.openweathermap.org/data/2.5/weather?q='+location +'&units=metric&APPID=' + weatherAPI
    request(url,function (error, response, body) {
      if (!error && response.statusCode == 200) {
        let weather = JSON.parse(body)
        let messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": weather.name,
                        "subtitle": weather.weather[0].description + " - " + weather.main.temp + " c",
                        "image_url": "http://openweathermap.org/img/w/"+weather.weather[0].icon+".png",
                    }]
                }
            }
        }
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token:token},
            method: 'POST',
            json: {
                recipient: {id:sender},
                message: messageData,
            }
        }, function(error, response, body) {
            if (error) {
                console.log('Error sending messages: ', error)
            } else if (response.body.error) {
                console.log('Error: ', response.body.error)
            }
        })
        if (weather.main.temp < 6) {
          fbm.sendTextMessage(sender, "Think you need a coat! If I was fancy I would turn on the heating!")
        }
      }
    })
  }
};
