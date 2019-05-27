/**
 * https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/
 */

const { generateErrorObject } = require('./error')
const https = require('https')
const { URL } = require('url')

function extractCode (event) {
  const queryStringParameters = event.queryStringParameters || {}
  return queryStringParameters.code
}

async function exchangeCodeForToken (code) {
  const api = new URL('/login/oauth/access_token', 'https://github.com')
  api.searchParams.set('client_id', process.env.CLIENT_ID)
  api.searchParams.set('client_secret', process.env.CLIENT_SECRET)
  api.searchParams.set('code', code)

  return asyncHttpsPostRequest(api)
}

async function asyncHttpsPostRequest (url) {
  return new Promise(function (resolve, reject) {
    https.request({
      method: 'POST',
      host: url.host,
      path: url.pathname + url.search,
      headers: {
        'Accept': 'application/json'
      }
    }, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
      resp.on('end', () => {
        try {
          let parsed = JSON.parse(data)
          resolve(parsed)
        } catch (e) {
          reject(data)
        }
      })
    }).on('error', reject)
      .end()
  })
}

exports.handler = async (event) => {

  if (!process.env.CLIENT_ID) {
    return generateErrorObject('CLIENT_ID is not set in environment')
  }

  if (!process.env.CLIENT_SECRET) {
    return generateErrorObject('CLIENT_SECRET is not set in environment')
  }

  if (!process.env.OAUTH_CALLBACK_URL) {
    return generateErrorObject('OAUTH_CALLBACK_URL is not set in environment')
  }

  const code = extractCode(event)

  if (!code) {
    return generateErrorObject('did not get expected query string named [code]')
  }

  let response
  try {
    response = await exchangeCodeForToken(code)
  } catch (e) {
    return generateErrorObject('Failed to exchange code for access_token')
  }

  if (!response || !response.access_token) {
    return generateErrorObject('did not receive expected [access_token]')
  }

  return {
    statusCode: 302,
    headers: {
      Location: process.env.OAUTH_CALLBACK_URL + '?access_token=' + response.access_token
    },
    body: null
  }
}
