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
// add middleware
app.use(logger)
// Index route
app.get('/', (req, res) => {
    res.render('index', {
      'title':'Martin',
    })
})
// for Facebook verification
app.get('/webhook/', (req, res) => {
    if (req.query['hub.verify_token'] === 'secret-token') {
        res.send(req.query['hub.challenge'])
        res.sendStatus(200)
    }
    res.send('Error, wrong token')
})
// Endpoint webhook
app.post('/webhook/', (req, res) => {
  req.body.entry.forEach((entry) =>{
    entry.messaging.forEach((messaging_event)=>{
      console.log("event ",JSON.stringify(req.body.entry,null,2));
      fbm.handleMessage(messaging_event)
      res.sendStatus(200)
    })
  })

})
// Sonos route
app.post('/sonos/',(req,res) => {
  let arg = req.body.arg;
  var spawn = require("child_process").spawn;
  var process = spawn('python',["sonos-controller.py", arg]);
  res.sendStatus(200)
})
// Callback from spotify
app.post('/spotify/callback/',(req,res) => {
  res.render('index', {
    'title':'Spotify Logged in',
  })
  res.sendStatus(200)
})
// Spin up the server
app.listen(app.get('port'), () => {
    console.log('running on port', app.get('port'))
    console.log(app.get('host'));
})
