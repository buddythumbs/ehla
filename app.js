'use strict'
// dependencies
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const path = require('path');
const LOG = require('./services/middleware')
// Config
const Config = require('./config')

// Routes
const routes = require('./routes/index')
const webhook = require('./routes/webhooks')
const spotify = require('./routes/spotify');
const sonos = require('./routes/sonos');

// Initiate app
const app = express()

// Setup views
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

// Setup port
app.set('port', (process.env.PORT || 5000))
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
// Process application/json
app.use(bodyParser.json())

// Routing
app.use('/',routes)
app.use('/webhook',webhook)
app.use('/sonos',sonos)
app.use('/spotify',spotify)

// add middleware
// app.use(LOG.log)

// Spin up the server
app.listen(app.get('port'), () => {
    console.log('running on port', app.get('port'))
})
