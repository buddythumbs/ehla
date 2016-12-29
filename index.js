'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const path = require('path');

const fbm = require('./js/messenger-handles');

// Initiate app
const app = express()

// Setup views
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

// Setup port
app.set('port', (process.env.PORT || 5000))
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json())
// Log all incoming traffic
let logger = (req,res,next) => {
  console.log(JSON.stringify(req.body,null,2));
  next();
}

app.use(logger)
// Index route
app.get('/', (req, res) => {
    res.render('index', {
      'title':'Martin',
    })
})
// for Facebook verification
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === 'secret-token') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})
// Endpoint webhook
app.post('/webhook', (req, res) => {
  let messaging_events = req.body.entry[0].messaging
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    // console.log("Sender: ",event.sender);
    // console.log("Incoming event: ",JSON.stringify(event,null,2));
    if (event.message) {
      if (event.message && event.message.text) {
        let text = event.message.text
        fbm.getUser(sender,text);
      }else{
        fbm.handleMedia(sender,event);
      }
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback)
      fbm.sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
      continue
    }
  }
  res.sendStatus(200)
})
// Sonos route
app.post('/sonos',(req,res) => {
  let arg = req.body.arg;
  var spawn = require("child_process").spawn;
  var process = spawn('python',["sonos-controller.py", arg]);
  res.sendStatus(200)
})
// Spin up the server
app.listen(app.get('port'), () => {
    console.log('running on port', app.get('port'))
    console.log(app.get('host'));
})
