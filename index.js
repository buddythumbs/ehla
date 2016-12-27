'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const martin = '1021053801339481'
const laragh = '1162641380518805'
const token = "EAADhwQPQXKcBAHlW2N5TCSNdGfZAV6zseswplofZB0uK3nBsGZB0ZBJF2X21OExJCkGkxBQRTVWlKE0upHTGGfJCAVNTPx9SDv1Wzsem8RZCWULb2KEY7SS58w30zTvPpZAXVc8ZBzvBGZB23yOsxkpCN4fNo7ydbcD4acG0lFS4AwZDZD"

// Setup port
app.set('port', (process.env.PORT || 5000))
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json())
// Index route
app.get('/', function (req, res) {
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
    console.log(event.sender);
    console.log(JSON.stringify(event,null,2));
    if (event.message) {
      if (event.message && event.message.text) {
          let text = event.message.text
          // console.log(event.message.From.Name);
          handleMessage(sender,text);
      }else if(event.message.sticker_id){
        if (event.message.sticker_id) {
          handlSticker(sender, event.message.sticker_id)
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
function handleMessage(sender,text) {
  let hello = false
  if (text === 'Pic') {
      sendGenericMessage(sender)
  }else if (text.match(/fuck/i)) {
    sendTextMessage(sender, "No fuck you")
  }else if (text.match(/hey|hello|hi/i)){
    if(sender === martin) {
      sendTextMessage(sender, "Hello Martin , how are you today?")
    }else if (sender === laragh) {
      sendTextMessage(sender, "Hello Laragh , how are you today?")
    }
  }else if (text.match(/good/i)) {
    sendTextMessage(sender, "Great, what can I do for you today?")
  }else if (text.toLowerCase() === "help") {
    sendTextMessage(sender, "Help:\n Type 'Pic' to get back a picture\nType 'Hello/Hi/Hey' to get a response\n")
  } else {
    sendTextMessage(sender, "Hello " + sender)
  }
}
// Handle stiker
function handlSticker(sender,sticker_id) {
  sendSticker(sender,sticker_id);
}
// get user
function getUser(id) {

}
// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})
