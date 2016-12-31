'use strict'
const Config = require('../config');
const request = require('request');
const weather = require('./weather');
const sns = require('./sonos');

// const token = "EAADhwQPQXKcBAHlW2N5TCSNdGfZAV6zseswplofZB0uK3nBsGZB0ZBJF2X21OExJCkGkxBQRTVWlKE0upHTGGfJCAVNTPx9SDv1Wzsem8RZCWULb2KEY7SS58w30zTvPpZAXVc8ZBzvBGZB23yOsxkpCN4fNo7ydbcD4acG0lFS4AwZDZD"
// const msgUrl = "https://graph.facebook.com/v2.6/me/messages"

// SETUP A REQUEST TO FACEBOOK SERVER
var newRequest = request.defaults({
	uri: 'https://graph.facebook.com/v2.6/me/messages',
	method: 'POST',
	json: true,
	qs: {
		access_token: Config.FB_PAGE_TOKEN
	},
	headers: {
		'Content-Type': 'application/json'
	},
})


// SETUP A MESSAGE FOR THE FACEBOOK REQUEST
var newMessage = function (recipientId, msg, atts, cb) {
	var opts = {
		form: {
			recipient: {
				id: recipientId
			},
		}
	}
	if (atts) {
    console.log("ATTS :",atts)
    if (atts.quick_replies) {
      let message = {
        text: msg,
        quick_replies : atts,
      }
      console.log("Quick replies :",message)
    }else if (atts.sender_action) {
      let message = {
        atts
      }
      console.log("Sender Action:",message)
    } else {
      let message = {
        attachment: {
          "type": atts,
          "payload": {
            "url": msg
          }
        }
      }
    }
	} else {
    console.log("Text ",msg);
		let message = {
			text: msg
		}
	}
  console.log("MESSAGE :",message)
	opts.form.message = message
	newRequest(opts, function (err, resp, data) {
		if (cb) {
			cb(err || data.error && data.error.message, data)
		}
	})
}

var handleMessage = (messaging_event) => {
  // console.log(JSON.stringify(messaging_event,null,2));
  let event = messaging_event
  let sender = event.sender.id
  seen(sender)
  typing(sender)
  getUser(sender).then((user)=>{
    if (event.message) {
      if (event.message.quick_reply) {
        handleQuickReply(sender,event)
      }else if (event.message && event.message.text) {
        let text = event.message.text
        if (text.match(/hey|hello|hi/i)){
          let quickReplies = {
            "quick_replies":[{
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
            ]}
          newMessage(sender,"Hey " + user.first_name + "! \nWhat can I do for you ? ... beep boop",quickReplies)
        }else if (text.toLowerCase() === "help") {
          newMessage(sender,"Help:\n Type 'Pic' to get back a picture\nType 'Hello/Hi/Hey' to get a response\n")
        }else if (text.toLowerCase().match(/sonos/)) {
          sns.handleRequest(text)
        }else if (text.match(/thanks|nice|great/)) {
          newMessage(sender,"beep boop 👍")
        } else {
          newMessage(sender,"bipipipip boop ... Sorry " + user.first_name + ", I don't know how to handle that request...yet 😳💩")
        }
      }else{
        handleMedia(sender,user,event);
      }
    }else if (event.postback) {
      newMessage(sender,"Postback received: " + JSON.stringify(event.postback).substring(0, 200))
    }
  }, function(error) {
      console.log('Error getting user: ', error)
  });
}

var getUser = (id,text) => {
  return new Promise((resolve, reject) => {
    request('https://graph.facebook.com/v2.6/' + id +'?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + Config.FB_PAGE_TOKEN,
     (error, response, body) => {
      if (!error && response.statusCode == 200) {
        resolve(JSON.parse(body))
      } else {
        reject(error || response.body.error)
      }
    })
  })
}

var handleMedia = (sender,user,event) => {
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
}

var sendVideo = (sender,videoUrl) =>{
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
}

var sendImg = (sender,imgUrl) =>{
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
}

var sendAudio = (sender,audioUrl) =>{
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
}

var sendAudio = (sender,audioUrl) =>{
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
}

var sendFile = (sender,fileUrl) =>{
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
}

// var postMessage = (json)=>{
//   return new Promise((resolve, reject) => {
//     request({
//       url: msgUrl,
//       qs: {access_token:Config.FB_PAGE_TOKEN},
//       method: 'POST',
//       json: json
//     },(error, response, body) => {
//         if (!error && response.statusCode == 200) {
//           resolve(response.statusCode)
//           module.exports.typingOff(json.recipient.id)
//         } else {
//           reject(error || response.body.error)
//         }
//       })
//     })
// }

var handleQuickReply = (sender,event) =>{
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

var seen = (sender) => {
  newMessage(sender,"",{"sender_action":"typing_on"});
}

var typing = (sender) => {
  newMessage(sender,"",{"sender_action":"mark_seen"});
}

var typingOff = (sender) => {
  newMessage(sender,"",{"sender_action":"typing_off"});
}

module.exports = {
  handleMessage : handleMessage,
  getUser : getUser,
  handleMedia: handleMedia,
  sendVideo : sendVideo,
  sendImg : sendImg,
  sendAudio : sendAudio,
  sendFile : sendFile,
  // postMessage : postMessage,
  handleQuickReply : handleQuickReply,
  seen : seen,
  typing : typing,
  typingOff : typingOff
};
