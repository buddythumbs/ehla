'use strict'

module.exports = {
  handleRequest : (arg) =>{
    console.log("Argument to SONOS :",arg);
    let arg = req.body.arg;
    var spawn = require("child_process").spawn;
    var process = spawn('python',["sonos-controller.py", arg]);
    process.stdout.on('data', (data)=>{
      // Do something with the data returned from python script
      console.log("SONOS Reply :", data);
    });
  }
}
