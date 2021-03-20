const https = require('https')

exports.asyncHttpsRequest = async function asyncHttpsRequest (url, method, headers = {}) {
  return new Promise(function (resolve, reject) {
    https.request({
      method: method,
      host: url.host,
      path: url.pathname + url.search,
      headers: { 'Accept': 'application/json', ...headers}
    }, (resp) => {
      let data = ''
      resp.on('data', (chunk) => {
        data += chunk
      })
      resp.on('end', () => {
        try {
          let parsed = JSON.parse(data)
          resolve(parsed)
        } catch (e) {
          reject(data)
        }
      })
    }).on('error', reject)
      .end()
  })
}
