'use strict'

const express = require('express');
const router = express.Router();
const config = require('../config');

// homepage
router.get('/',(req,res,next)=>{
  res.render('index', {
    'title':'Beep boop - I am a robot!'
  })
})

module.exports = router
