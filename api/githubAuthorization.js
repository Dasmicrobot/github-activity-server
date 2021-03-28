const { generateErrorObject } = require('./error')
const baseUrl = 'https://github.com'
const authorizePath = '/login/oauth/authorize'
const scope = 'user:email,read:org,repo:status'
const allowSignup = 'false'
const authorizationUrl = `${baseUrl}${authorizePath}?client_id=${process.env.CLIENT_ID}&scope=${scope}&allow_signup=${allowSignup}`

exports.handler = async (event, context) => {

  if (!process.env.CLIENT_ID) {
    return generateErrorObject('CLIENT_ID is not set in environment')
  }

  return {
    statusCode: 302,
    headers: {
      Location: authorizationUrl
    },
    body: null
  }
}
