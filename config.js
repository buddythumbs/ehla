'use strict';

// Facebook
const WIT_TOKEN = process.env.WIT_TOKEN || '3D7CR3AUUUEQ3FZR5SN4HO4KULQUMKEJ'
if (!WIT_TOKEN) {
  throw new Error('Missing WIT_TOKEN. Go to https://wit.ai/docs/quickstart to get one.')
}

var FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN || 'EAADhwQPQXKcBAHlW2N5TCSNdGfZAV6zseswplofZB0uK3nBsGZB0ZBJF2X21OExJCkGkxBQRTVWlKE0upHTGGfJCAVNTPx9SDv1Wzsem8RZCWULb2KEY7SS58w30zTvPpZAXVc8ZBzvBGZB23yOsxkpCN4fNo7ydbcD4acG0lFS4AwZDZD';
if (!FB_PAGE_TOKEN) {
	throw new Error('Missing FB_PAGE_TOKEN. Go to https://developers.facebook.com/docs/pages/access-tokens to get one.')
}

var FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'secret-token'
if (!FB_VERIFY_TOKEN) {
	throw new Error('Missing FB_VERIFY_TOKEN. Go to your page messenger settings to set one then set it in your server env.')
}

//  Spotify
const client_id ='922fd6d57a574533ad71af5ee413bafd'; // Your client id
const client_secret = 'd146e8174eca484283f5e4fda760396f'; // Your secret
const redirect_uri = 'https://young-ravine-36771.herokuapp.com/webhook/spotify/callback/' // Your redirect uri
const scopes = 'user-read-private user-read-email'

module.exports = {
  WIT_TOKEN: WIT_TOKEN,
  FB_PAGE_TOKEN: FB_PAGE_TOKEN,
  FB_VERIFY_TOKEN: FB_VERIFY_TOKEN,
  S_CLIENT_ID : client_id,
  S_CLIENT_SECRET : client_secret,
  S_SCOPES : scopes
}
