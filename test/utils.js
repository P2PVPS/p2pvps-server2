const mongoose = require('mongoose')
const rp = require('request-promise')

const LOCALHOST = 'http://localhost:5000'

// Wipe the DB.
function cleanDb () {
  for (const collection in mongoose.connection.collections) {
    if (mongoose.connection.collections.hasOwnProperty(collection)) {
      mongoose.connection.collections[collection].remove()
    }
  }
}

// Create the first test user
// TODO refactor and Replace this code with a request-promise equivelant.
function authUser (agent, callback) {
  agent
    .post('/api/users')
    .set('Accept', 'application/json')
    .send({ user: { username: 'test', password: 'pass' } })
    .end((err, res) => {
      if (err) { return callback(err) }

      callback(null, {
        user: res.body.user,
        token: res.body.token
      })
    })
}

// This function is used to create new users.
// userObj = {
//   username,
//   password
// }
async function createUser (userObj) {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/users`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        user: {
          username: userObj.username,
          password: userObj.password
        }
      }
    }

    let result = await rp(options)

    const retObj = {
      user: result.body.user,
      token: result.body.token
    }

    return retObj
  } catch (err) {
    console.log('Error in utils.js/createUser(): ' + JSON.stringify(err, null, 2))
    throw err
  }
}

async function loginTestUser () {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/auth`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        username: 'test',
        password: 'pass'
      }
    }

    let result = await rp(options)

    // console.log(`result: ${JSON.stringify(result, null, 2)}`)

    const retObj = {
      token: result.body.token,
      user: result.body.user.username,
      id: result.body.user._id.toString()
    }

    return retObj
  } catch (err) {
    console.log('Error authenticating test user: ' + JSON.stringify(err, null, 2))
    throw err
  }
}

async function loginAdminUser () {
  try {
    process.env.NODE_ENV = process.env.NODE_ENV || 'dev'
    console.log(`env: ${process.env.NODE_ENV}`)

    const FILENAME = `../config/system-user-${process.env.NODE_ENV}.json`
    const adminUserData = require(FILENAME)
    console.log(`adminUserData: ${JSON.stringify(adminUserData, null, 2)}`)

    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/auth`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        username: adminUserData.username,
        password: adminUserData.password
      }
    }

    let result = await rp(options)

    // console.log(`result: ${JSON.stringify(result, null, 2)}`)

    const retObj = {
      token: result.body.token,
      user: result.body.user.username,
      id: result.body.user._id.toString()
    }

    return retObj
  } catch (err) {
    console.log('Error authenticating test admin user: ' + JSON.stringify(err, null, 2))
    throw err
  }
}

// Create a device
async function createDevice (config) {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/devices`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        device: {
          ownerUser: 'test',
          renterUser: 'test',
          privateData: 'test',
          obContract: '',
          rentStartDate: 'test',
          expiration: 'test',
          deviceName: 'test',
          deviceDesc: 'test',
          rentHourlyRate: 'test',
          subdomain: 'test',
          httpPort: 'test',
          sshPort: 'test',
          memory: 'test',
          diskSpace: 'test',
          processor: 'test',
          internetSpeed: 'test',
          checkinTimeStamp: 'test'
        }
      },
      headers: {
        Authorization: `Bearer ${config.token}`
      }
    }

    let result = await rp(options)

    return result.body.device
  } catch (err) {
    console.error('Error in utils.js/createDevice()!')
    console.log('Error stringified: ' + JSON.stringify(err, null, 2))
    throw err
  }
}

async function addDeviceToRentedList (config) {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/renteddevices`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        deviceId: config
      }
    }

    return await rp(options)
  } catch (err) {
    console.error('Error in utils.js/addDeviceToRentedList()!')
    console.log('Error stringified: ' + JSON.stringify(err, null, 2))
    throw err
  }
}

async function createObContract (config) {
  try {
    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/obcontract`,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        Authorization: `Bearer ${config.token}`
      },
      body: {
        obContract: {
          ownerUser: config.userId,
          clientDevice: config.deviceId,
          title: 'test',
          description: 'test description'
        }
      }
    }

    let result = await rp(options)

    // console.log(`result: ${JSON.stringify(result, null, 2)}`)

    return result.body.obContract._id.toString()
  } catch (err) {
    console.error('Error in utils.js/createObContract()!')
    console.log('Error stringified: ' + JSON.stringify(err, null, 2))
    throw err
  }
}

module.exports = {
  cleanDb,
  authUser,
  createDevice,
  loginTestUser,
  loginAdminUser,
  createUser,
  addDeviceToRentedList,
  createObContract
}
