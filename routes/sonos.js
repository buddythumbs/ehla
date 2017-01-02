'use strict'

const express = require('express');
const router = express.Router();

(req,res) => {
  let arg = req.body.arg;
  var spawn = require("child_process").spawn;
  var process = spawn('python',["sonos-controller.py", arg]);
  res.sendStatus(200)
}

let handleRequest = (req,res) =>{
  console.log("Argument to SONOS :",req.body.arg);
  if (!req.body.arg) {
    req.body.arg = "--play"
  }
  var spawn = require("child_process").spawn;
  var process = spawn('python',["../python/sonos-controller.py", req.body.arg]);
  process.stdout.on('data', (data)=>{
    // Do something with the data returned from python script
    console.log("SONOS Reply :", data);
  });
  res.sendStatus(200)
}
// Sonos route
router.get('/',handleRequest)

module.exports = router
