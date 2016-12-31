'use strict'
const Config = require('../config');
const request = require('request');
const weather = require('./weather');
const sns = require('./sonos');

var logIt = (object) =>{
  if (typeof object === 'object') {
    console.log(JSON.stringify(object,null,2));
  }else {
    console.log(object);
  }
}

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
var newMessage = (recipientId, msg, atts, cb)=> {
	var opts = {
		form: {
			recipient: {
				id: recipientId
			},
		}
	}
  //  Handle attachments in variety of forms
  if (atts) {
    logIt({"ATTS ":atts})
    if (atts.quick_replies) {
      opts.form.message = {
        text: msg,
        quick_replies : atts,
      }
      logIt({"Quick replies":opts.form.message})
    }else if (atts.sender_action) {
      opts.form.sender_action = atts.sender_action
      logIt({"Sender Action":opts})
    } else {
      opts.form.message = {
        attachment: {
          "type": atts,
          "payload": {
            "url": msg
          }
        }
      }
      logIt({"MESSAGE ":opts.form.message})
    }
	} else {
    logIt({"Text":msg});
		opts.form.message = {
			text: msg
		}
    logIt({"MESSAGE ":opts.form.message})
	}
	newRequest(opts, function (err, resp, data) {
		if (cb) {
			cb(err || data.error && data.error.message, data)
		}
	})
}
// PARSE A FACEBOOK MESSAGE to get user, message body, or attachment
// https://developers.facebook.com/docs/messenger-platform/webhook-reference
var getMessageEntry = (body) => {
	var val = body.object === 'page' &&
						body.entry &&
						Array.isArray(body.entry) &&
						body.entry.length > 0 &&
						body.entry[0] &&
						body.entry[0].messaging &&
						Array.isArray(body.entry[0].messaging) &&
						body.entry[0].messaging.length > 0 &&
						body.entry[0].messaging[0]
	return val || null
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
              },{
                "content_type":"text",
                "title":"Sonos",
                "payload":"sonos-player"
              },{
                "content_type":"text",
                "title":"Heating",
                "payload":"heating-manager"
              },{
                "content_type":"text",
                "title":"Random Fact",
                "payload":"query-wiki"
              }]
            }
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
    request('https://graph.facebook.com/v2.6/' +
      id +
      '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' +
      Config.FB_PAGE_TOKEN,
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
      // case "location":
      //   weather.getWeather(event.message.attachments[0].payload.coordinates)
      //   .then((response) => {
      //     let  msg = ""
      //     let atts =
      //     newMessage({
      //       "recipient": {
      //         "id":sender
      //       },
      //       "message": {
      //           "attachment": {
      //               "type": "template",
      //               "payload": {
      //                   "template_type": "generic",
      //                   "elements": [{
      //                       "title": "Weather in " + response.name,
      //                       "subtitle": response.weather[0].description + " - " + response.main.temp + " celsius",
      //                       "image_url": "http://openweathermap.org/img/w/"+ response.weather[0].icon+".png",
      //                   }]
      //               }
      //           }
      //       }
      //   })
      //   if (response.main.temp < 6) {
      //       module.exports.postMessage({
      //           "recipient": {
      //             "id":sender
      //           },
      //           "message": {
      //             "text":"Think you need a coat! If I was fancy I would turn on the heating!"
      //           }
      //       })
      //     }
      //   }, function(error) {
      //     console.error("Failed!", error);
      //   })
      //   break;
      case "image":
      console.log('Image');
      if (attachment.payload.sticker_id) {
        if (attachment.payload.sticker_id === 369239263222822) {
          let msg = "beep boop 👍"
          newMessage(sender,msg)
        }
      }
        break;
      default:

    }
  })
}

var sendVideo = (sender,videoUrl) =>{
  let msg = videoUrl
  let atts = "video"
  newMessage(sender,msg,atts)
}

var sendImg = (sender,imgUrl) =>{
  let msg = imgUrl
  let atts = "image"
  newMessage(sender,msg,atts)
}

var sendAudio = (sender,audioUrl) =>{
  let msg = audioUrl
  let atts = "audio"
  newMessage(sender,msg,atts)
}

var sendFile = (sender,fileUrl) =>{
  let msg = audioUrl
  let atts = "file"
  newMessage(sender,msg,atts)
}

var handleQuickReply = (sender,event) =>{
  console.log(event.message.text.toLowerCase());
  switch (event.message.text.toLowerCase()) {
    case "weather":
      let msg = "Where do you want the weather for?";
      let atts = {
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
      newMessage(sender,msg,atts)
      break;
    case "sonos":

      break;
    case "home":
      weather.getWeather().then((response) => {
        let msg = "Weather in " +
            response.name +
            ":" +
            response.weather[0].description +
            " - " +
            response.main.temp +
            " celsius"
        newMessage(sender,msg)
        if (response.main.temp < 6) {
          let msg = "Think you need a coat! If I was fancy I would turn on the heating!"
          newMessage(sender,msg)
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
  let atts = {"sender_action":"typing_on"}
  let msg = ""
  newMessage(sender,msg,atts);
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
  newRequest : newRequest,
  handleQuickReply : handleQuickReply,
};
