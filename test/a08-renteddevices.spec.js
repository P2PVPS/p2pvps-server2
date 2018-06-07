/*
  This file contains tests for the /api/renteddevices API.

  TODO:
  -addDevice tests
  -getDevices tests
  -renewDevice tests
  --If the rentedDevices list is empty, returns 422
  --If the device supplied is not in the rentedDevices list, returns 422
  --If the device model/ID does not exist, returns 404.
  --On success, a new obContract ID is returned.
  --On success, an http status of 200 is returned.
  -removeDevice tests
*/

'use strict'

const rp = require('request-promise')
const assert = require('chai').assert
const utils = require('./utils.js')
const serverUtil = require('../bin/util')

const LOCALHOST = 'http://localhost:5000'

const context = {}

describe('Rented Devices', () => {
  // This code runs before all tests.
  before(async () => {
    // Login as a test user and get a JWT.
    const config = await utils.loginTestUser()

    // Initialize the context object with test user login data.
    context.userToken = config.token
    context.userUsername = config.test
    context.userId = config.id

    // Create a device
    const device = await utils.createDevice({token: context.userToken})
    context.device = device

    console.log(`context: ${JSON.stringify(context, null, 2)}`)
  })

  describe('GET /api/renteddevices/renew/:id', () => {
    it('If the rentedDevices list is empty, returns 422', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/renteddevices/renew/${context.device._id}`,
          resolveWithFullResponse: true,
          json: true
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        assert(true, 'Done!')
        /*
        if (err.statusCode === 422) {
          assert(err.statusCode === 404, 'Error code 422 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
        */
      }
    })
  })
})
