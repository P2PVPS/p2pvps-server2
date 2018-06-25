/*
  This is a library file that can be imported to easily make API calls.
*/

const rp = require('request-promise')

const LOCALHOST = 'http://localhost:5000'

// Request a new port assignment.
async function getPrivateModel (config) {
  try {
    const options = {
      method: 'GET',
      uri: `${LOCALHOST}/api/deviceprivatedata/${config.id}`,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        Authorization: `Bearer ${config.adminToken}`
      }
    }

    let result = await rp(options)

    // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

    return result.body
  } catch (err) {
    console.error(`Error in modules/devicePrivateData/index.js/getPrivateModel()`)
    throw err
  }
}

module.exports = {
  getPrivateModel
}
