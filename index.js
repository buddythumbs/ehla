'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const martin = '1021053801339481'
const laragh = '1162641380518805'
const token = "EAADhwQPQXKcBAHlW2N5TCSNdGfZAV6zseswplofZB0uK3nBsGZB0ZBJF2X21OExJCkGkxBQRTVWlKE0upHTGGfJCAVNTPx9SDv1Wzsem8RZCWULb2KEY7SS58w30zTvPpZAXVc8ZBzvBGZB23yOsxkpCN4fNo7ydbcD4acG0lFS4AwZDZD"
const weatherAPI = '8ba0a17ada98c62ad89a2f76f571960d'
const location = 'Maynooth,ie'
// Setup port
app.set('port', (process.env.PORT || 5000))
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json())
// Index route
app.get('/', function (req, res) {
    console.log(req.protocol,req.get('host'));
    res.send('Hello world, I am a chat bot')
})
// for Facebook verification
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'secret-token') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})
// Endpoint webhook
app.post('/webhook', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    console.log("Sender: ",event.sender);
    console.log("Incoming event: ",JSON.stringify(event,null,2));
    if (event.message) {
      if (event.message && event.message.text) {
          let text = event.message.text
          // console.log(event.message.From.Name);
          getUser(sender,text);
      }else if(event.message.sticker_id){
        if (event.message.sticker_id) {
          getUser(sender, event.message.sticker_id)
        }
      }
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
      continue
    }
  }
  res.sendStatus(200)
})
// Sonos route
app.post('/sonos',function (req,res) {
  let arg = req.body.arg;
  var spawn = require("child_process").spawn;
  var process = spawn('python',["sonos-controller.py", arg]);
  res.sendStatus(200)
})
// Sky remote
// app.post('/sky',function (req,res) {
//   let arg = req.body.arg;
//   var spawn = require("child_process").spawn;
//   var process = spawn('python',["sonos-controller.py", arg]);
//   res.sendStatus(200)
// })
// Return function for webhook
function sendTextMessage(sender, text) {
    let messageData = { text:text }
    let json = {
        recipient: {id:sender},
        message: messageData,
    }
    console.log(json);
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: json,
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
// Return function for webhook
function sendSticker(sender,id) {
    let messageData = {
      "sticker_id": 369239263222822,
       "attachments": [
         {
           "type": "image",
           "payload": {
             "url": "https://scontent.xx.fbcdn.net/t39.1997-6/851557_369239266556155_759568595_n.png?_nc_ad=z-m",
             "sticker_id": 369239263222822
           }
         }
       ]
     }
    let json = {
        recipient: {id:sender},
        message: messageData,
    }
    // console.log(json);
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: json,
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
// Send back a card
function sendGenericMessage(sender) {
    let messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Picture",
                    "subtitle": "First pic",
                    "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://www.messenger.com",
                        "title": "web url"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }, {
                    "title": "Second card",
                    "subtitle": "Element #2 of an hscroll",
                    "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
                    "buttons": [{
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Payload for second element in a generic bubble",
                    }],
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
}
// Handle message
function handleMessage(sender,text,user) {
  // console.log(name);
  if (text === 'Pic') {
    sendGenericMessage(sender)
  }else if (text.match(/weather|conditions|forecast|outside/i)) {
    console.log("Getting weather");
    getWeather(sender,user)
  }else if (text.match(/fuck/i)) {
    sendTextMessage(sender, "No fuck you")
  }else if (text.match(/hey|hello|hi/i)){
    sendTextMessage(sender, "What can I do for you " + user.first_name + "?")
  }else if (text.toLowerCase() === "help") {
    sendTextMessage(sender, "Help:\n Type 'Pic' to get back a picture\nType 'Hello/Hi/Hey' to get a response\n")
  } else {
    sendTextMessage(sender, "Sorry " + user.first_name + ", I don't know how to handle that request...yet")
    sendTextMessage(sender, "😳💩")
  }
}
// Handle stiker
function handlSticker(sender,sticker_id) {
  sendSticker(sender,sticker_id);
}
// get user
function getUser(id,text) {
  request('https://graph.facebook.com/v2.6/' + id +'?fields=first_name,last_name&access_token=' + token, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body)) // Show the HTML for the Google homepage.
      let user = JSON.parse(body)
      handleMessage(id,text,user);
    }
  })
}
// Get weather
function getWeather(sender,user) {
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
        sendTextMessage(sender, "Think you need a coat! If I was fancy I would turn on the heating!")
      }
    }
  })
}

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
    console.log(app.get('host'));
})
