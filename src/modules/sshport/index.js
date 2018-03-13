/*
  This is a library file that can be imported to easily make API calls.
*/

const rp = require('request-promise')

const LOCALHOST = 'http://localhost:5000'

// Request a new port assignment.
async function requestPort () {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/sshport`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        test: true
      }
    }

    let result = await rp(options)

    // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

    return result.body.sshPort
  } catch (err) {
    console.error(`Error in modules/sshport/index.js/requestPort(): `, err)
    throw err
  }
}

module.exports = {
  requestPort
}
