'use strict'

const express = require('express');
const router = express.Router();
const SO = require('../controller/sonos-controller');

// Sonos route
router.get('/',SO.indexResp)
router.get('/:request',SO.handleRequest)

module.exports = router
