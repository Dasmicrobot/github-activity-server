exports.generateErrorObject = (message) => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      error: message
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
}
