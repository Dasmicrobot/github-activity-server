const { constants } = require('./constants')
const { asyncHttpsRequest, findHeaderKey } = require('./request')
const { generateErrorObject } = require('./error')

/**
 * @see https://docs.github.com/en/rest/reference/repos
 * @param token Github token
 * @param orgName Github organisation name
 * @param [pushedWithinDays] returns only repositories that have been pushed to in the past
 * @returns {Promise<[]>}
 */
async function listRepositories (token, orgName, pushedWithinDays) {
  let repos = [];
  let hasNext = true;
  let pageNumber = 1;
  const itemsPerPage = 100;
  const apiUrl = new URL(`/orgs/${orgName}/repos?sort=pushed&direction=desc`, constants.githubApiBaseUrl)
  do {
    apiUrl.searchParams.set('page', `${pageNumber}`)
    apiUrl.searchParams.set('per_page', `${itemsPerPage}`)
    const { data } = await asyncHttpsRequest(apiUrl, 'GET', {
      Accept: constants.acceptGithubVndJson,
      Authorization: `token ${token}`
    });

    if (!Array.isArray(data) || data.length < 1) {
      hasNext = false;
    } else if (!isNaN(pushedWithinDays) && isFinite(pushedWithinDays) && pushedWithinDays > 0) {
      const now = Date.now();
      const matchingRepos = data.filter(repo => {
        const pushedAt = new Date(repo.pushed_at);
        pushedAt.setHours(0, 0, 0, 0);
        return (now - pushedAt.getTime()) < (pushedWithinDays * 24 * 3600 * 1000);
      });
      repos = [...repos, ...matchingRepos];

      // if repos were filtered then other pages will not contain
      // matching details due to sorting
      if (matchingRepos.length !== data.length) {
        hasNext = false;
      } else {
        pageNumber += 1;
      }
    } else {
      repos = [...repos, ...data];
      pageNumber += 1;
    }
  } while (hasNext);

  return repos;
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
  const organisation = (event.queryStringParameters && event.queryStringParameters.organisation) || '';
  if (!organisation) {
    return generateErrorObject('organisation query parameter is missing')
  }

  let pushedWithinDays = parseInt((event.queryStringParameters && event.queryStringParameters.pushedWithinDays) || '', 10);
  if (isNaN(pushedWithinDays) || pushedWithinDays < 1) {
    pushedWithinDays = null
  }

  let repos
  try {
    repos = await listRepositories(githubToken, organisation, pushedWithinDays)
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
      ...constants.commonResponseHeaders,
      ...constants.corsHeaders
    },
    body: JSON.stringify(repos)
  }
}
