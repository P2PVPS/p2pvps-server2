/*
  This file contains utility functions used by the server.
*/

const fs = require('fs')
const rp = require('request-promise')
const User = require('../src/models/users')

const LOCALHOST = 'http://localhost:5000'
const context = {}

// Ensure the environment variable is set
process.env.NODE_ENV = process.env.NODE_ENV || 'dev'
const env = process.env.NODE_ENV
const JSON_FILE = `system-user-${env}.json`

// Create the first user in the system. A 'admin' level system user that is
// used by the Listing Manager and test scripts, in order access private API
// functions.
async function createSystemUser () {
  // Create the system user.
  try {
    context.password = randomString(20)

    const options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/users`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        user: {
          username: 'system',
          password: context.password
        }
      }
    }
    let result = await rp(options)

    context.username = result.body.user.username
    context.id = result.body.user._id
    context.token = result.body.token

    // Get the mongoDB entry
    const user = await User.findById(context.id)

    // Change the user type to admin
    user.type = 'admin'
    // console.log(`user: ${JSON.stringify(user, null, 2)}`)

    // Save the user model.
    await user.save()

    // Write out the system user information to a JSON file that external
    // applications like the Task Manager and the test scripts can access.
    await _writeJSON(context, `${__dirname}/../persist/${JSON_FILE}`)

    return context
  } catch (err) {
    // Handle existing system user.
    if (err.statusCode === 422) {
      try {
        // Delete the existing user
        await deleteExistingSystemUser()

        // Call this function again.
        return createSystemUser()
      } catch (err2) {
        console.error(`Error in util.js/createSystemUser() while trying generate new system user: `, err2)
        // process.end(1)
        throw err2
      }
    } else {
      console.log('Error in util.js/createSystemUser: ' + JSON.stringify(err, null, 2))
      // process.end(1)
      throw err
    }
  }
}

async function deleteExistingSystemUser () {
  try {
    let result = await loginAdmin()

    const token = result.body.token
    const id = result.body.user._id.toString()

    // Delete the user.
    const options = {
      method: 'DELETE',
      uri: `${LOCALHOST}/api/users/${id}`,
      resolveWithFullResponse: true,
      json: true,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
    result = await rp(options)
    // console.log(`result2: ${JSON.stringify(result, null, 2)}`)

    return result.body.success
  } catch (err) {
    console.log(`Error in util.js/deleteExistingSystemUser()`)
    throw err
  }
}

async function loginAdmin () {
  // console.log(`loginAdmin() running.`)
  try {
    // Read the exising file
    const existingUser = await _readJSON(`${__dirname}/../persist/${JSON_FILE}`)
    // console.log(`existingUser: ${JSON.stringify(existingUser, null, 2)}`)

    // Log in as the user.
    let options = {
      method: 'POST',
      uri: `${LOCALHOST}/api/auth`,
      resolveWithFullResponse: true,
      json: true,
      body: {
        username: 'system',
        password: existingUser.password
      }
    }
    let result = await rp(options)
    // console.log(`result1: ${JSON.stringify(result, null, 2)}`)

    return result
  } catch (err) {
    console.error(`Error in bin/util.js/loginAdmin(): `, err)

    if (err.code === 'ELIFECYCLE') {
      console.log(`-->ELIFECYCLE detected.<--`)
    } else {
      console.log(`err: ${JSON.stringify(err, null, 2)}`)
    }

    throw err
  }
}

function randomString (length) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

// Writes out a JSON file of any object passed to the function.
// This is used for testing.
function _writeJSON (obj, fileName) {
  return new Promise(function (resolve, reject) {
    try {
      const fileStr = JSON.stringify(obj, null, 2)

      fs.writeFile(fileName, fileStr, function (err) {
        if (err) {
          console.error('Error while trying to write file: ', err)
          return reject(err)
        } else {
          // console.log(`${fileName} written successfully!`)
          return resolve()
        }
      })
    } catch (err) {
      console.error('Error trying to write out object in util.js/_writeJSON().', err)
      return reject(err)
    }
  })
}

// Read and parse a JSON file.
function _readJSON (fileName) {
  return new Promise(function (resolve, reject) {
    try {
      fs.readFile(fileName, (err, data) => {
        if (err) throw err

        const obj = JSON.parse(data)

        return resolve(obj)
      })
    } catch (err) {
      console.error('Error trying to read JSON file in util.js/_readJSON().', err)
      return reject(err)
    }
  })
}

module.exports = {
  createSystemUser,
  randomString,
  loginAdmin
}
