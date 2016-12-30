'use strict'

const request = require('request');
const weather = require('./weather');
const sns = require('./sonos');

const token = "EAADhwQPQXKcBAHlW2N5TCSNdGfZAV6zseswplofZB0uK3nBsGZB0ZBJF2X21OExJCkGkxBQRTVWlKE0upHTGGfJCAVNTPx9SDv1Wzsem8RZCWULb2KEY7SS58w30zTvPpZAXVc8ZBzvBGZB23yOsxkpCN4fNo7ydbcD4acG0lFS4AwZDZD"
const msgUrl = "https://graph.facebook.com/v2.6/me/messages"

module.exports = {
  handleMessage : (messaging_event) => {
    // console.log(JSON.stringify(messaging_event,null,2));
    let event = messaging_event
    let sender = event.sender.id
    module.exports.seen(sender)
    module.expmorts.typing(sender)
    module.exports.getUser(sender).then((user)=>{
      if (event.message) {
        if (event.message.quick_reply) {
          module.exports.handleQuickReply(sender,event)
        }else if (event.message && event.message.text) {
          let text = event.message.text
          if (text.match(/hey|hello|hi/i)){
            module.exports.postMessage({
                "recipient": {
                  "id":sender
                },
                "message": {
                  "text":"Hey " + user.first_name + "! damn you "+ (user.gender == "male"? "handsome!😍":"gorgeous! 😍") +
                  "\nWhat can I do for you ? ... beep boop",
                  "quick_replies":[
                    {
                      "content_type":"text",
                      "title":"Weather",
                      "payload":"query-weather"
                    },
                    {
                      "content_type":"text",
                      "title":"Sonos",
                      "payload":"sonos-player"
                    },
                    {
                      "content_type":"text",
                      "title":"Heating",
                      "payload":"heating-manager"
                    },
                    {
                      "content_type":"text",
                      "title":"Random Fact",
                      "payload":"query-wiki"
                    },
                  ]
                }
              })
          }else if (text.toLowerCase() === "help") {
            module.exports.postMessage({
                "recipient": {
                  "id":sender
                },
                "message": {
                  "text":"Help:\n Type 'Pic' to get back a picture\nType 'Hello/Hi/Hey' to get a response\n"
                }
            })
          }else if (text.toLowerCase().match(/sonos/)) {
            sns.handleRequest(text)
          }else if (text.match(/thanks|nice|great/)) {
            module.exports.postMessage({
                "recipient": {
                  "id":sender
                },
                "message": {
                  "text":"beep boop 👍"
                }
            })
          } else {
            module.exports.postMessage({
                "recipient": {
                  "id":sender
                },
                "message": {
                  "text":"bipipipip boop ... Sorry " + user.first_name + ", I don't know how to handle that request...yet 😳💩"
                }
            })
          }
        }else{
          module.exports.handleMedia(sender,user,event);
        }
      }else if (event.postback) {
        module.exports.postMessage({
            "recipient": {
              "id":sender
            },
            "message": {
              "text": "Postback received: " + JSON.stringify(event.postback).substring(0, 200), token
            }
        })
      }
    }, function(error, response, body) {
        if (error) {
            console.log('Error getting user: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
  },
  getUser : (id,text) => {
    return new Promise((resolve, reject) => {
      request('https://graph.facebook.com/v2.6/' + id +'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + token, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(JSON.parse(body))
        } else {
          reject(error || response.body.error)
        }
      })
    })
  },
  handleMedia: (sender,user,event) => {
    // console.log(event);
    let mediaType = event.message.attachments.forEach((attachment)=>{
      switch (attachment.type) {
        case "audio":
        console.log('Audio');
          break;
        case "location":
          weather.getWeather(event.message.attachments[0].payload.coordinates)
          .then((response) => {
          module.exports.postMessage({
              "recipient": {
                "id":sender
              },
              "message": {
                  "attachment": {
                      "type": "template",
                      "payload": {
                          "template_type": "generic",
                          "top_element_style": "compact",
                          "elements": [{
                              "title": "Weather in " + response.name,
                              "subtitle": response.weather[0].description + " - " + response.main.temp + " celsius",
                              "image_url": "http://openweathermap.org/img/w/"+ response.weather[0].icon+".png",
                          }]
                      }
                  }
              }
          })
          if (response.main.temp < 6) {
              module.exports.postMessage({
                  "recipient": {
                    "id":sender
                  },
                  "message": {
                    "text":"Think you need a coat! If I was fancy I would turn on the heating!"
                  }
              })
            }
          }, function(error) {
            console.error("Failed!", error);
          })
          break;
        case "image":
        console.log('Image');
        if (attachment.payload.sticker_id) {
          if (attachment.payload.sticker_id === 369239263222822) {
            module.exports.postMessage({
                "recipient": {
                  "id":sender
                },
                "message": {
                    "text":"beep boop 👍"
                }
              })
          }
        }
          break;
        default:

      }
    })
  },
  sendVideo : (sender,videoUrl) =>{
    let messageData = {
        "attachment": {
            "type": "video",
            "payload": {
                "url": videoUrl,
            }
        }
    }
    module.exports.postMessage({
          "recipient": {
            "id":sender
          },
          "message": messageData,
    }).then(()=>{
      console.log("Message posted back");
    })
  },
  sendImg : (sender,imgUrl) =>{
    let messageData = {
        "attachment": {
            "type": "image",
            "payload": {
                "url": imgUrl,
            }
        }
    }
    module.exports.postMessage({
          "recipient": {
            "id":sender
          },
          "message": messageData,
    }).then((result)=>{
      console.log(result);
    })
  },
  sendAudio : (sender,audioUrl) =>{
    let messageData = {
        "attachment": {
            "type": "audio",
            "payload": {
                "url": audioUrl,
            }
        }
    }
    module.exports.postMessage({
          "recipient": {
            "id":sender
          },
          "message": messageData,
    }).then((result)=>{
      console.log(result);
    })
  },
  sendFile : (sender,fileUrl) =>{
    module.exports.postMessage({
          "recipient": {
            "id":sender
          },
          "message": {
              "attachment": {
                  "type": "file",
                  "payload": {
                      "url": fileUrl,
                  }
              }
          },
    }).then(()=>{
      console.log("Message posted back");
    })
  },
  postMessage : (json)=>{
    return new Promise((resolve, reject) => {
      request({
        url: msgUrl,
        qs: {access_token:token},
        method: 'POST',
        json: json
      },(error, response, body) => {
          if (!error && response.statusCode == 200) {
            resolve(response.statusCode)
          } else {
            reject(error || response.body.error)
          }
        })
      })
  },
  handleQuickReply : (sender,event) =>{
    console.log(event.message.text.toLowerCase());
    switch (event.message.text.toLowerCase()) {
      case "weather":
      module.exports.postMessage({
          "recipient": {
            "id":sender
          },
          "message": {
            "text":"Where do you want the weather for?",
            "quick_replies":[
              {
                "content_type":"text",
                "title":"Home",
                "payload":"home-weather"
              },
              {
                "content_type":"location",
                "title":"My Location",
                "payload":"locale-weather"
              }
            ]
          }
        })
        break;
      case "sonos":

        break;
      case "home":
        weather.getWeather().then((response) => {
        module.exports.postMessage({
            "recipient": {
              "id":sender
            },
            "message": {
              "attachment": {
                  "type": "template",
                  "payload": {
                      "template_type": "generic",
                      "top_element_style": "compact",
                      "elements": [{
                          "title": "Weather in " + response.name,
                          "subtitle": response.weather[0].description + " - " + response.main.temp + " celsius",
                          "image_url": "http://openweathermap.org/img/w/"+ response.weather[0].icon+".png",
                      }]
                  }
              }
            }
        })
        if (response.main.temp < 6) {
            module.exports.postMessage({
                "recipient": {
                  "id":sender
                },
                "message": {
                  "text":"Think you need a coat! If I was fancy I would turn on the heating!"
                }
            })
          }
        }, function(error) {
          console.error("Failed!", error);
        })
        break;
      case "heating":

        break;
      case "random fact":

        break;
      default:

    }
  }
  seen (sender) => {
    module.exports.postMessage({
        "recipient":{
      	"id":sender
      },
      "sender_action":"typing_on"
    });
  },
  typing (sender) => {
    odule.exports.postMessage({
        "recipient":{
      	"id":sender
      },
      "sender_action":"mark_seen"
    });
  }
};
