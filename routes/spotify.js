'use strict'

const express = require('express');
const router = express.Router();
const SP = require('../controller/spotify-controller');

// Callback from spotify
router.get('/callback/',SP.callbackResp)
// Callback from spotify
router.get('/',SP.indexResp)

module.exports = router
