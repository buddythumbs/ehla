'use strict'

const request = require('request');
const weather = require('./weather');

const token = "EAADhwQPQXKcBAHlW2N5TCSNdGfZAV6zseswplofZB0uK3nBsGZB0ZBJF2X21OExJCkGkxBQRTVWlKE0upHTGGfJCAVNTPx9SDv1Wzsem8RZCWULb2KEY7SS58w30zTvPpZAXVc8ZBzvBGZB23yOsxkpCN4fNo7ydbcD4acG0lFS4AwZDZD"

module.exports = {
  sendTextMessage : (sender, text) => {
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
  handleMessage : (messaging_event) => {
    console.log(JSON.stringify(messaging_event,null,2));
    let event = messaging_event
    let sender = event.sender.id
    module.exports.getUser(sender).then((user)=>{
      if (event.message) {
        if (event.message && event.message.text) {
          let text = event.message.text
          if (text.match(/weather|conditions|forecast|outside/i)) {
            weather.getWeather().then((response) => {
              let messageData = {
                  "attachment": {
                      "type": "template",
                      "payload": {
                          "template_type": "generic",
                          "elements": [{
                              "title": response.name,
                              "subtitle": response.weather[0].description + " - " + response.main.temp + " c",
                              "image_url": "http://openweathermap.org/img/w/"+ response.weather[0].icon+".png",
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
              if (response.main.temp < 6) {
                module.exports.sendTextMessage(sender, "Think you need a coat! If I was fancy I would turn on the heating!")
              }
            }, function(error) {
              console.error("Failed!", error);
            })
          }else if (text.match(/fuck/i)) {
            module.exports.sendTextMessage(sender, "No fuck you " + user.first_name)
          }else if (text.match(/hey|hello|hi/i)){
            module.exports.sendTextMessage(sender, "What can I do for you " + user.first_name + "?")
          }else if (text.toLowerCase() === "help") {
            module.exports.sendTextMessage(sender, "Help:\n Type 'Pic' to get back a picture\nType 'Hello/Hi/Hey' to get a response\n")
          }else if (text.toLowerCase().match(/sonos/)) {
            let arg = text.replace(/sonos/i,"").trim();
            var spawn = require("child_process").spawn;
            var process = spawn('python',["sonos-controller.py", arg]);
            console.log("Spawned python");
            process.stdout.on('data', (data)=>{
              console.log(data.toString())
            });
            process.stdout.on('end', (data)=>{
              console.log(data.toString())
            });
          } else {
            module.exports.sendTextMessage(sender, "Sorry " + user.first_name + ", I don't know how to handle that request...yet 😳💩")
          }
        }else{
          console.log("Handling mediaType");
          module.exports.handleMedia(sender,user,event);
        }
      }
      if (event.postback) {
        let text = JSON.stringify(event.postback)
        module.exports.sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
      }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
  },
  getUser : (id,text) => {
    return new Promise((resolve, reject) => {
      request('https://graph.facebook.com/v2.6/' + id +'?fields=first_name,last_name&access_token=' + token, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body))
        } else {
          reject(error || response.body.error)
        }
      })
    })
  },
  handleMedia: (sender,user,event) => {
    console.log(event);
    let mediaType = event.message.attachments.forEach((attachment)=>{
      switch (attachment.type) {
        case "audio":
        console.log('Audio');
          break;
        case "location":
        console.log('Location');
          break;
        case "image":
        console.log('Image');
        if (attachment.payload.sticker_id) {
          if (attachment.payload.sticker_id === 369239263222822) {
            module.exports.sendTextMessage(sender, "beep boop 💻")
          }
        }
          break;
        default:

      }
    })
  },
};
