'use strict'

// Tokens from config.js
const config = require('../config');
const client_id = config.S_CLIENT_ID
const client_secret = config.S_CLIENT_SECRET
const scopes = config.S_SCOPES
// Callback handler
let callbackHand = (req,res) => {
  res.render('index', {
    'title':'Spotify Logged in',
  })
}
// Index route handler
let indexHand = (req,res) => {
  res.render('index', {
    'title':'Hello There spotifier',
  })
}

module.exports = {
  callbackResp : callbackHand,
  indexResp : indexHand
};
