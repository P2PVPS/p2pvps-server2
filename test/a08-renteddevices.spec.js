/*
  This file contains tests for the /api/renteddevices API.

  TODO:
  -renewDevice tests
  --If the device model/ID does not exist, returns 404.
  --On success, a new obContract ID is returned.
  --On success, an http status of 200 is returned.
*/

'use strict'

const rp = require('request-promise')
const assert = require('chai').assert
const utils = require('./utils.js')

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

    // console.log(`context: ${JSON.stringify(context, null, 2)}`)
  })

  describe('POST /renteddevices', () => {
    it('should reject if device ID does not match a public device in the DB', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/renteddevices`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            deviceId: '123'
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        // console.log(`err: ${JSON.stringify(err, null, 2)}`)
        assert(err.statusCode === 404, 'Error code 404 expected.')
      }
    })

    it('should add device ID to the rentedDevices list', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/renteddevices`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            deviceId: context.device._id
          }
        }

        let result = await rp(options)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.success === true, 'Success exected.')
      } catch (err) {
        console.error(err)
        assert(false, 'Unexpected result')
      }
    })
  })

  describe('GET /renteddevices', () => {
    it('should return contents of rentedDevices array', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/renteddevices`,
          resolveWithFullResponse: true,
          json: true
        }

        let result = await rp(options)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert.isArray(result.body.devices, 'Returns an array')
      } catch (err) {
        console.error(err)
        assert(false, 'Unexpected result')
      }
    })
  })

  describe('DELETE /renteddevices', () => {
    it('should throw 404 if device is not in list', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/renteddevices/123`,
          resolveWithFullResponse: true,
          json: true
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        // console.error(`err: ${JSON.stringify(err, null, 2)}`)
        assert(err.statusCode === 404, 'Returns HTTP status 404.')
      }
    })

    it('should delete the device from the list', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/renteddevices/${context.device._id}`,
          resolveWithFullResponse: true,
          json: true
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.success === true, 'Success exected.')
      } catch (err) {
        console.error(`err: ${JSON.stringify(err, null, 2)}`)
        assert(false, 'Unxpected result')
      }
    })

    it('should throw 404 if list is empty', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/renteddevices/${context.device._id}`,
          resolveWithFullResponse: true,
          json: true
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        // console.error(`err: ${JSON.stringify(err, null, 2)}`)
        assert(err.statusCode === 404, 'Returns HTTP status 404.')
      }
    })
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
        assert(err.statusCode === 422, 'Returns HTTP status 422.')
      }
    })

    it('If the device ID is not in the rentedDevices list, returns 422', async () => {
      try {
        // Create a device
        const newDevice = await utils.createDevice({token: context.userToken})

        // Add device ID to the list, so that it's not empty.
        await utils.addDeviceToRentedList(newDevice._id)

        context.device2 = newDevice

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
        assert(err.statusCode === 422, 'Returns HTTP status 422.')
      }
    })

    it('Renews the device.', async () => {
      try {
        // Add the device ID to the list, so that it's not empty.
        await utils.addDeviceToRentedList(context.device._id)

        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/renteddevices/renew/${context.device._id}`,
          resolveWithFullResponse: true,
          json: true
        }

        let result = await rp(options)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.success === true, 'Success exected.')
        assert.match(result.body.obContract, /^[0-9a-fA-F]{24}$/, 'obContract is a valid GUID.')
      } catch (err) {
        console.log(`err stringified: ${JSON.stringify(err, null, 2)}`)
        assert(false, 'Unexpected result')
      }
    })
  })
})
