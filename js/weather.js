'use strict'

const request = require('request');
const FB = require('./messenger-handles');

const weatherAPI = '8ba0a17ada98c62ad89a2f76f571960d'
const location = 'Maynooth,ie'
const token = "EAADhwQPQXKcBAHlW2N5TCSNdGfZAV6zseswplofZB0uK3nBsGZB0ZBJF2X21OExJCkGkxBQRTVWlKE0upHTGGfJCAVNTPx9SDv1Wzsem8RZCWULb2KEY7SS58w30zTvPpZAXVc8ZBzvBGZB23yOsxkpCN4fNo7ydbcD4acG0lFS4AwZDZD"
let wUrl = 'http://api.openweathermap.org/data/2.5/weather?q='+location +'&units=metric&APPID=' + weatherAPI

module.exports = {
  getWeather : (location) => {
    console.log(location);
    if (location) {
      wUrl = 'http://api.openweathermap.org/data/2.5/weather?lat='+
      location.lat +'&lon='+location.long + '&units=metric&APPID=' + weatherAPI
      console.log(wUrl);
    }
    return new Promise((resolve, reject) => {
      request(wUrl,(error, response, body) => {
        if (!error && response.statusCode == 200) {
          FB.logIt({"WEATHER":body})
          resolve(JSON.parse(body))
        } else {
          reject(error || response.body.error)
        }
      })
    })
  }
};
