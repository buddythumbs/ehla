'use strict'

const request = require('request');
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path');
const config = require('../config')

let witRequest = (text) => {
  return new Promise(function(resolve, reject) {
    request({
      uri : config.WIT_EP + encodeURIComponent(text),
      qs :{
        access_token : config.WIT_TOKEN
      },
    },(err,res,body)=>{
      if (!err && response.statusCode == 200) {
        resolve(body)
      }else {
        reject(err)
      }
    })
  });
}

module.exports = {
  witRequest : witRequest
};
