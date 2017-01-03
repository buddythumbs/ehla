'use strict'

const express = require('express');
const router = express.Router();
const SP = require('../controller/spotify-controller');

// Callback from spotify
router.get('/callback/',SP.callbackResp)
// Callback from spotify
router.get('/',SP.indexResp)
// Login route
router.get('/login/',SP.login)
// Refresh
router.get('/refresh_token',SP.refreshHand)
module.exports = router
