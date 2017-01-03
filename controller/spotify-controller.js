'use strict'

// Tokens from config.js
const config = require('../config');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const request = require('request');

const client_id = config.S_CLIENT_ID
const client_secret = config.S_CLIENT_SECRET
const scopes = config.S_SCOPES
const S_REDIRECT = config.S_REDIRECT
const uuidV1 = require('uuid/v1');
console.log(S_REDIRECT);
var stateKey = 'spotify_auth_state'


// Callback handler
let callbackHand = (req, res) => {
  console.log(req.body);
  // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  if (false) {
    res.redirect('/' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: S_REDIRECT,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token,
            refresh_token = body.refresh_token;
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
        // use the access token to access the Spotify Web API
        request.get(options, (error, response, body) => {
          console.log(body);
        });
        console.log("Refresh Token :",refresh_token);
        console.log("Access Token :",access_token);
        // we can also pass the token to the browser to make requests from there
        // res.redirect('/#' +
        //   querystring.stringify({
        //     access_token: access_token,
        //     refresh_token: refresh_token
        //   }));
      } else {
        console.log("Error :",error);
      }
    });
  }
};
let indexHand = (req,res) => {
  res.render('spotify', {
    'title':'Hello There spotifier',
    'display_name':'display_name',
    'id':'id',
    'email':'email',
    'href':'href',
    'img_url':'img_url',
  })
}
let login = (req, res) => {
  var state = uuidV1()
  res.cookie(stateKey, state);
  // your application requests authorization
  var scope = scopes;
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: S_REDIRECT,
      state: state
    }));
}
let refreshHand = (req,res) => {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };
  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
};

module.exports = {
  callbackResp : callbackHand,
  indexResp : indexHand,
  login : login,
  refreshHand : refreshHand
};
