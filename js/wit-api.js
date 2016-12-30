'use-strict'

const request = require('request');

const TOKEN = "3D7CR3AUUUEQ3FZR5SN4HO4KULQUMKEJ"

module.exports = {
  messageWit : (string) =>{
    return new Promise((resolve, reject) => {
      request({
        url: "https://api.wit.ai/message",
        qs: {access_token:TOKEN},
        method: 'POST',
        json: {
          'q': 'set an alarm in 10min',
        }
      },(error, response, body) => {
          if (!error && response.statusCode == 200) {
            console.log(JSON.stringify(body,null,2));
            resolve(JSON.stringify(body,null,2))
          } else {
            reject(error || response.body.error)
          }
        })
      })
    })

}
