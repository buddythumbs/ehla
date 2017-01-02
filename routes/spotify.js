'use strict'

const path = require('path');
const request = require('request');

const express = require('express');
const router = express.Router();
// Tokens from config.js
const config = require('../config');
const client_id = config.S_CLIENT_ID
const client_secret = config.S_CLIENT_SECRET
const scopes = config.S_SCOPES

// Callback from spotify
router.post('/callback/',(req,res) => {
  res.render('index', {
    'title':'Spotify Logged in',
  })
  res.sendStatus(200)
})

module.exports = router
