const { asyncHttpsRequest } = require('./request')
const { generateErrorObject } = require('./error')

async function listRepositories (token, orgName) {
  let repos = [];
  let hasNext = true;
  let pageNumber = 1;
  const itemsPerPage = 100;
  const apiUrl = new URL(`/orgs/${orgName}/repos`, 'https://api.github.com')
  do {
    apiUrl.searchParams.set('access_token', `${token}`)
    apiUrl.searchParams.set('page', `${pageNumber}`)
    apiUrl.searchParams.set('per_page', `${itemsPerPage}`)
    const response = await asyncHttpsRequest(apiUrl, 'GET', { 'User-Agent': 'GitActivity 1.0' });
    if (response && Array.isArray(response) && response.length > 0) {
      repos = [...repos, ...response];
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

  if (!repos || !Array.isArray(repos)) {
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
