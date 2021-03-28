const { constants } = require('./constants')
const { asyncHttpsRequest } = require('./request')
const { generateErrorObject } = require('./error')

/**
 * @see https://docs.github.com/en/rest/reference/repos
 * @param token Github token
 * @param orgName Github organisation name
 * @returns {Promise<[]>}
 */
async function listRepositories (token, orgName) {
  let repos = [];
  let hasNext = true;
  let pageNumber = 1;
  const itemsPerPage = 100;
  const apiUrl = new URL(`/orgs/${orgName}/repos`, constants.githubApiBaseUrl)
  do {
    apiUrl.searchParams.set('page', `${pageNumber}`)
    apiUrl.searchParams.set('per_page', `${itemsPerPage}`)
    const { data } = await asyncHttpsRequest(apiUrl, 'GET', {
      Accept: constants.acceptGithubVndJson,
      Authorization: `token ${token}`
    });
    if (Array.isArray(data) && data.length > 0) {
      repos = [...repos, ...data];
      pageNumber += 1;
    } else {
      hasNext = false;
    }
  } while (hasNext);

  return repos;
}

exports.handler = async (event, context) => {
  const githubToken = event.headers['X-Github-Token'] || '';
  if (!githubToken) {
    return generateErrorObject('X-Github-Token header is missing')
  }
  const organisation = (event.queryStringParameters && event.queryStringParameters.organisation) || '';
  if (!organisation) {
    return generateErrorObject('organisation query parameter is missing')
  }

  let repos
  try {
    repos = await listRepositories(githubToken, organisation)
  } catch (e) {
    console.log(e)
    return generateErrorObject('Failed to list repositories')
  }

  if (!Array.isArray(repos)) {
    return generateErrorObject('did not find anything')
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(repos)
  }
}
