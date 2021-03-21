const { constants } = require('./constants')
const { asyncHttpsRequest } = require('./request')
const { generateErrorObject } = require('./error')

/**
 * @see https://docs.github.com/en/rest/reference/orgs
 * @param token Github token
 * @returns {Promise<Array>}
 */
async function listOrganisations (token) {
  let organisations = [];
  let numberOfApiCalls = 0;
  let hasNext = true;
  let idSince = null;
  const itemsPerPage = 100;
  const apiUrl = new URL(`/organizations`, constants.githubApiBaseUrl)
  do {
    if (numberOfApiCalls > 20) {
      throw new Error("Highly likely there is an infinite loop here");
    }
    numberOfApiCalls++;
    apiUrl.searchParams.set(constants.githubAccessTokenParam, `${token}`)
    apiUrl.searchParams.set('per_page', `${itemsPerPage}`)
    if (idSince) {
      apiUrl.searchParams.set('since', `${idSince}`)
    }
    const response = await asyncHttpsRequest(apiUrl, 'GET', {
      Accept: constants.acceptGithubVndJson
    });
    if (Array.isArray(response) && response.length > 0) {
      organisations = [...organisations, ...response];
      idSince = response[response.length - 1].id
    } else {
      hasNext = false;
    }
  } while (hasNext && (!organisations.length || idSince != null));

  return organisations;
}

exports.handler = async (event, context) => {
  const githubToken = event.headers[constants.headerGithubToken] || '';
  if (!githubToken) {
    return generateErrorObject(`${constants.headerGithubToken} header is missing`)
  }

  let organisations
  try {
    organisations = await listOrganisations(githubToken)
  } catch (e) {
    console.log(e)
    return generateErrorObject('Failed to list organisations')
  }

  if (!Array.isArray(organisations)) {
    return generateErrorObject('did not find anything')
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(organisations)
  }
}
