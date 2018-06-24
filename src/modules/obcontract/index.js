/*
  This is a library file that can be imported to easily make API calls.
*/

const rp = require('request-promise')

const LOCALHOST = 'http://localhost:5000'

// Create a new OpenBazaar contract. Input:
// token - the auth token of a logged in user.
// obContract - an object matching the obContract model.
async function createContract (token, obContract) {
  try {
    // console.log(`obContract: ${JSON.stringify(obContract, null, 2)}`)
    // console.log(`config.token: ${config.token}`)

    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/obcontract`,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`
      },
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

// Update an obContract model.
async function updateContract (token, obContract) {
  try {
    // console.log(`contractObj: ${JSON.stringify(contractObj, null, 2)}`)

    const options = {
      method: 'PUT',
      uri: `${LOCALHOST}/api/obcontract/${obContract._id.toString()}`,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        obContract
      }
    }

    let result = await rp(options)

    // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

    return result.body.obContract
  } catch (err) {
    console.error(`Error in modules/obcontract/index.js/updateContract(): `, err)
    throw err
  }
}

async function getContract (contractId) {
  try {
    const options = {
      method: 'GET',
      uri: `${LOCALHOST}/api/obcontract/${contractId}`,
      // resolveWithFullResponse: true,
      json: true
    }

    let result = await rp(options)

    // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

    return result.obContract
  } catch (err) {
    console.error(`Error in modules/obcontract/index.js/getContract().`)
    throw err
  }
}

// Remove an obContract model from the database.
async function removeContract (config) {
  try {
    const options = {
      method: 'DELETE',
      uri: `${LOCALHOST}/api/obcontract/${config.obContractId}`,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    }

    let result = await rp(options)

    // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

    return result.body.success
  } catch (err) {
    console.error(`Error in modules/obcontract/index.js/removeContract(): `)
    throw err
  }
}

module.exports = {
  createContract,
  updateContract,
  getContract,
  removeContract
}
