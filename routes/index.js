'use strict'

const express = require('express');
const router = express.Router();
const config = require('../config');

// homepage
router.get('/',(req,res,next)=>{
  res.render('index', {
    'title':'Beep boop - I am a robot!',
    'img' : config.root + '/public/messenger_code_395838780757925.png'
  })
})

module.exports = router
