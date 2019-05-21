const baseUrl = 'https://github.com'
const authorizePath = '/login/oauth/authorize'
const scope = 'user:email,read:org'
const allowSignup = 'false'

exports.handler = async(event, context) => {

    let stageVariables = event.stageVariables || {}
    if (!stageVariables.CLIENT_ID) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "CLIENT_ID is not set in stageVariables"
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }

    let authorizationUrl = `${baseUrl}${authorizePath}?client_id=${stageVariables.CLIENT_ID}&scope=${scope}&allow_signup=${allowSignup}`
    return {
        statusCode: 302,
        headers: {
            Location: authorizationUrl
        },
        body: null
    }
};
