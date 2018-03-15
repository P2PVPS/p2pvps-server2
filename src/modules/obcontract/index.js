/*
  This is a library file that can be imported to easily make API calls.
*/

const rp = require('request-promise')

const LOCALHOST = 'http://localhost:5000'

// Create a new OpenBazaar contract. Input:
// token - the auth token of a logged in user.
// contractObj - an object matching the obContract model.
async function createContract (obContract) {
  try {
    // console.log(`contractObj: ${JSON.stringify(contractObj, null, 2)}`)

    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/obcontract`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        obContract
      }
    }

    let result = await rp(options)

    // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

    return result.body.obContract
  } catch (err) {
    console.error(`Error in modules/obcontract/index.js/createContract(): `, err)
    throw err
  }
}

function helloWorld () {
  console.log('hello world')
}

module.exports = {
  createContract,
  helloWorld
}
