const { constants } = require('./constants')
const { asyncHttpsRequest, findHeaderKey } = require('./request')
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
  const apiUrl = new URL(`/user/orgs`, constants.githubApiBaseUrl)
  do {
    if (numberOfApiCalls > 20) {
      throw new Error("Highly likely there is an infinite loop here");
    }
    numberOfApiCalls++;
    apiUrl.searchParams.set('per_page', `${itemsPerPage}`)
    if (idSince) {
      apiUrl.searchParams.set('since', `${idSince}`)
    }
    const { data } = await asyncHttpsRequest(apiUrl, 'GET', {
      Accept: constants.acceptGithubVndJson,
      Authorization: `token ${token}`
    });
    if (Array.isArray(data) && data.length > 0) {
      organisations = [...organisations, ...data];
      idSince = data[data.length - 1].id
      if (data.length < itemsPerPage) {
        hasNext = false;
        idSince = null;
      }
    } else {
      hasNext = false;
    }
  } while (hasNext && (!organisations.length || idSince != null));

  return organisations;
}

exports.handler = async (event, context) => {
  const headerGithubToken = findHeaderKey(event.headers, constants.headerGithubToken);
  if (!headerGithubToken) {
    return generateErrorObject(`${constants.headerGithubToken} header is missing`)
  }
  const githubToken = event.headers[headerGithubToken] || '';
  if (!githubToken) {
    return generateErrorObject(`${constants.headerGithubToken} value not set`)
  }
  let organisations
  try {
    organisations = await listOrganisations(githubToken)
  } catch (e) {
    return generateErrorObject('Failed to list organisations')
  }

  if (!Array.isArray(organisations)) {
    return generateErrorObject('did not find anything')
  }

  return {
    statusCode: 200,
    headers: {
      ...constants.commonResponseHeaders,
      ...constants.corsHeaders
    },
    body: JSON.stringify(organisations)
  }
}
