const https = require('https')
const { constants } = require('./constants')

exports.asyncHttpsRequest = async function asyncHttpsRequest (url, method, headers = {}) {
  return new Promise(function (resolve, reject) {
    https.request({
      method: method,
      host: url.host,
      path: url.pathname + url.search,
      headers: {
        'Accept': 'application/json',
        'User-Agent': constants.uaString,
        ...headers
      }
    }, (resp) => {
      let data = ''
      let responseObj = {
        status: resp.statusCode,
        headers: resp.headers,
        data: null
      }
      resp.on('data', (chunk) => {
        data += chunk
      })
      resp.on('end', () => {
        try {
          responseObj.data = JSON.parse(data)
          if (resp.statusCode >= 200 && resp.statusCode < 300) {
            resolve(responseObj)
          } else {
            reject(responseObj)
          }
        } catch (e) {
          responseObj.data = data
          reject(responseObj)
        }
      })
    }).on('error', reject)
      .end()
  })
}
