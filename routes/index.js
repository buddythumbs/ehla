'use strict'

const express = require('express');
const router = express.Router();

// homepage
router.get('/',(req,res,next)=>{
  res.render('index', {
    'title':'Beep boop',
  })
})

module.exports = router
