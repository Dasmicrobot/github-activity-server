exports.handler = async (event) => {
  let stageVariables = event.stageVariables || {}
  if (!stageVariables.AUTH_CALLBACK_URL) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "AUTH_CALLBACK_URL is not set in stageVariables"
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }

  let access_token = 'FOOBAR'



  return {
    statusCode: 302,
    headers: {
      Location: stageVariables.AUTH_CALLBACK_URL + '?access_token=' + access_token
    },
    body: null
  }
};
