'use strict'

const request = require('request');
const weather = require('./weather');

const token = "EAADhwQPQXKcBAHlW2N5TCSNdGfZAV6zseswplofZB0uK3nBsGZB0ZBJF2X21OExJCkGkxBQRTVWlKE0upHTGGfJCAVNTPx9SDv1Wzsem8RZCWULb2KEY7SS58w30zTvPpZAXVc8ZBzvBGZB23yOsxkpCN4fNo7ydbcD4acG0lFS4AwZDZD"

module.exports = {
  sendTextMessage: (sender, text) => {
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
  },
  sendSticker : (sender,id) => {
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
  },
  sendGenericMessage : (sender) => {
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
    },
  handleMessage : function (sender,text,user) {
    // console.log(name);
    if (text === 'Pic') {
      thissendGenericMessage(sender)
    }else if (text.match(/weather|conditions|forecast|outside/i)) {
      console.log("Getting weather");
      weather.getWeather(sender,user)
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
  },
  handlSticker : (sender,sticker_id) => {
    sendSticker(sender,sticker_id);
  },
  getUser : (id,text) => {
    request('https://graph.facebook.com/v2.6/' + id +'?fields=first_name,last_name&access_token=' + token, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(JSON.parse(body))
        let user = JSON.parse(body)
        this.handleMessage(id,text,user)
      }
    })
  },
};
