/**
 * https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/
 */

const { constants } = require('./constants')
const { generateErrorObject } = require('./error')
const { asyncHttpsRequest } = require('./request')
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

  return asyncHttpsRequest(api, 'POST')
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
    console.log('response', response)
    return generateErrorObject('did not receive expected [access_token]')
  }

  return {
    statusCode: 302,
    headers: {
      Location: `${process.env.OAUTH_CALLBACK_URL}?${constants.authRedirectTokenParam}=${response.access_token}`
    },
    body: null
  }
}
