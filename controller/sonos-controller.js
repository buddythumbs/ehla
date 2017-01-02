'use strict'

const config = require('../config');
const PythonShell = require('python-shell');
PythonShell.defaultOptions = { scriptPath: config.root + '/python/' };

let handleRequest = (req,res) => {
  console.log("Argument to SONOS :",req.params.request);
  var options = {
    mode: 'text',
    args: [req.params.request],
  };
  PythonShell.run('sonos-controller.py',options,function (err, results) {
    if (err) console.log(err)
    console.log('results: %j', results);
  });
  res.sendStatus(200)
}

let indexResp = (req,res)=>{
  res.render('index', {
    'title':'SONOS Stuff',
  })
}

module.exports = {
  indexResp : indexResp,
  handleRequest : handleRequest
};
