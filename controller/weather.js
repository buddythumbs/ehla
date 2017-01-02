'use strict'

const request = require('request');
const FB = require('./messenger-handles');
const config = require('../config');

const weatherAPI = config.W_CLIENT_ID
const location = config.W_LOCATION
const token = config.W_VERIFY_TOKEN
let wUrl = 'http://api.openweathermap.org/data/2.5/weather?q='+location +'&units=metric&APPID=' + weatherAPI

let getWeather = (location) => {
  console.log(location);
  if (location) {
    wUrl = 'http://api.openweathermap.org/data/2.5/weather?lat='+
    location.lat +'&lon='+location.long + '&units=metric&APPID=' + weatherAPI
    console.log(wUrl);
  }
  return new Promise((resolve, reject) => {
    request(wUrl,(error, response, body) => {
      if (!error && response.statusCode == 200) {
        // FB.logIt({"WEATHER":body})
        resolve(JSON.parse(body))
      } else {
        reject(error || response.body.error)
      }
    })
  })
}

module.exports = {
  getWeather : getWeather
};
