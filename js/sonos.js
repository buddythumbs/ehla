'use strict'

let handleRequest = (arg) =>{
  console.log("Argument to SONOS :",arg);
  if (!arg) {
    arg = "--play"
  }
  var spawn = require("child_process").spawn;
  var process = spawn('python',["../sonos-controller.py", arg]);
  process.stdout.on('data', (data)=>{
    // Do something with the data returned from python script
    console.log("SONOS Reply :", data);
  });
}

module.exports = {
  handleRequest : handleRequest
}
