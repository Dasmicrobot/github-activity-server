const { generateErrorObject } = require('../lib/error')

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

  let access_token = 'FOOBAR'

  return {
    statusCode: 302,
    headers: {
      Location: process.env.OAUTH_CALLBACK_URL + '?access_token=' + access_token
    },
    body: null
  }
}
