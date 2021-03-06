'use strict'
const FB = require('../controller/messenger-handles');

const express = require('express');
const router = express.Router();

// for Facebook verification
router.get('/', FB.tokenVerification)
// Endpoint webhook
router.post('/', FB.incoming)

module.exports = router;
