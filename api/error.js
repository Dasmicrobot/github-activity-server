const { constants } = require('./constants')

exports.generateErrorObject = (message) => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: message
    }),
    headers: {
      ...constants.commonResponseHeaders,
      ...constants.corsHeaders
    }
  }
}
