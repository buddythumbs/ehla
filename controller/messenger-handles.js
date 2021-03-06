'use strict'
const Config = require('../config');
const request = require('request');
const weather = require('./weather');
const sns = require('../routes/sonos');
const witAPI = require('../services/witAPI')
const welcome = {
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

var logIt = (object) =>{
  if (typeof object === 'object') {
    console.log(JSON.stringify(object,null,2));
  }else {
    console.log(object);
  }
}

// SETUP A MESSAGE FOR THE FACEBOOK REQUEST
var newMessage = (recipientId, msg, atts, cb)=> {
  var opts = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
          access_token:Config.FB_PAGE_TOKEN
        },
        method: 'POST',
        json: {
    			recipient: {
    				id: recipientId
    			},
    		}
    }
  //  Handle attachments in variety of forms
  if (atts) {
    if (atts.quick_replies) { // If it's a quick reply
      opts.json.message = {
        text: msg,
        quick_replies : atts.quick_replies,
      }
      logIt({"Quick replies":opts.json.message})
    }else if (atts.sender_action) { // Else if it's sender action
      opts.json.sender_action = atts.sender_action
      logIt({"Sender Action":opts})
    } else { // ELse it's just a normal attachment
      opts.json.message = {
        attachment: {
          "type": atts,
          "payload": {
            "url": msg
          }
        }
      }
      logIt({"MESSAGE ":opts.json.message})
    }
	} else {
    logIt({"Text":msg});
		opts.json.message = {
			text: msg
		}
    logIt({"MESSAGE ":opts.json.message})
	}
  return new Promise(function(resolve, reject) {
    request(opts,(error, response, body) => {
      if (!error && response.statusCode == 200) {
        logIt({"Reply":body});
        resolve()
      } else {
        logIt({"Error":error || response.body.error});
        reject(error || response.body.error)
      }
    })
  });

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
  getUser(sender).then((user)=>{
    if (event.message) {
      if (event.message.quick_reply) {
        handleQuickReply(sender,event)
      }else if (event.message && event.message.text) {
        typing(sender)
        let text = event.message.text
        console.log(witAPI.witRequest(text))
        // if (text.match(/hey|hello|hi|👋/i)){
        //   let url = 'https://scontent.xx.fbcdn.net/v/t34.0-12/15870941_10207508265653446_564443884_n.gif?_nc_ad=z-m&oh=cb1ff0bece4af4b01ff3c00ae17ef8a5&oe=586CB6DA'
        //   let atts = 'image'
        //   // sendImg(sender,url)
        //   typingOff(sender)
        //   newMessage(sender,"Hey " + user.first_name + "! \nWhat can I do for you ? ... beep boop",welcome)
        // }else if (text.toLowerCase() === "help") {
        //   newMessage(sender,"Help:\n Type 'Pic' to get back a picture\nType 'Hello/Hi/Hey' to get a response\n")
        //   typingOff(sender)
        // }else if (text.toLowerCase().match(/sonos/)) {
        //   sns.handleRequest(text)
        // }else if (text.match(/thanks|nice|great/)) {
        //   newMessage(sender,"beep boop 👍")
        //   typingOff(sender)
        // } else {
        //   newMessage(sender,"bipipipip boop ... Sorry " + user.first_name + ", I don't know how to handle that request...yet 😳💩")
        //   typingOff(sender)
        // }
      }else{
        handleMedia(sender,user,event);
      }
    }else if (event.postback) {
      newMessage(sender,"Postback received: " + JSON.stringify(event.postback).substring(0, 200))
      typingOff(sender)
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
      case "location":
        weather.getWeather(event.message.attachments[0].payload.coordinates)
        .then((response) => {
          // var msg = "The weather in " + response.name + ": "
          // newMessage(sender,msg)
          var msg = response.main.temp +
            " celsius with " +
            response.weather[0].description +
            " in " +
            response.name
          newMessage(sender,msg)
          if (response.main.temp < 6) {
              let msg = "Think you need a coat! If I was fancy I would turn on the heating!"
              newMessage(sender,msg)
          }
        }, function(error) {
          console.error("Failed!", error);
        })
        break;
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
      typingOff(sender)
      break;
    case "sonos":
      sns.handleRequest("--play")
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
        typingOff(sender)
        if (response.main.temp < 6) {
          let msg = "Think you need a coat! If I was fancy I would turn on the heating!"
          newMessage(sender,msg)
          typingOff(sender)
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
  let atts = {"sender_action":"mark_seen"}
  let msg = ""
  newMessage(sender,msg,atts);
}

var typing = (sender) => {
  newMessage(sender,"",{"sender_action":"typing_on"});
}

var typingOff = (sender) => {
  newMessage(sender,"",{"sender_action":"typing_off"});
}

var tokenVerification = (req, res) => {
    if (req.query['hub.verify_token'] === 'secret-token') {
        res.send(req.query['hub.challenge'])
        res.sendStatus(200)
    }
    res.send('Error, wrong token')
}

var incoming = (req, res) => {
  req.body.entry.forEach((entry) =>{
    entry.messaging.forEach((messaging_event)=>{
      handleMessage(messaging_event)
    })
  })
  res.sendStatus(200)
}

module.exports = {
  handleMessage : handleMessage,
  getUser : getUser,
  handleMedia: handleMedia,
  sendVideo : sendVideo,
  sendImg : sendImg,
  sendAudio : sendAudio,
  sendFile : sendFile,
  handleQuickReply : handleQuickReply,
  logIt : logIt,
  tokenVerification : tokenVerification,
  incoming : incoming
};
