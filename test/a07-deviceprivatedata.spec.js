/*
  Tests for the devicePrivateData model

  Dev Note 3/12/18:
  Thought about adding these two tests to the PUT API:
    Assert the ownerUser has not changed.
    Assert the publicData has not changed.
  But since this is a private API for admins, maybe I don't want to enforce that?
*/

const utils = require('./utils.js')
const rp = require('request-promise')
const assert = require('chai').assert
const serverUtil = require('../bin/util')

const LOCALHOST = 'http://localhost:5000'

const context = {}

describe('Device Private Model', () => {
  before(async () => {
    // Login as a test user and get a JWT.
    const config = await utils.loginTestUser()

    // Initialize the context object with test user login data.
    context.userToken = config.token
    context.userUsername = config.test
    context.userId = config.id

    // Create and system admin user
    const adminUser = await serverUtil.createSystemUser()
    // console.log(`adminUser: ${JSON.stringify(adminUser, null, 2)}`)
    context.adminToken = adminUser.token
    context.adminUsername = adminUser.username
    context.adminId = adminUser.id

    // Create a device
    const device = await utils.createDevice({token: context.userToken})
    context.device = device
    // console.log(`device: ${JSON.stringify(device, null, 2)}`)
  })

  describe('GET /api/deviceprivatedata/:id', () => {
    it('should throw 404 if model doesn\'t exist', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/deviceprivatedata/5b300aae03c8ad14123286af`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.adminToken}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 404) {
          assert(err.statusCode === 404, 'Error code 404 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 401 for normal user', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/deviceprivatedata/${context.device.privateData}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.userToken}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        }
      }
    })

    it('should fetch for admin user', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/deviceprivatedata/${context.device.privateData}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.adminToken}`
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.devicePrivateData._id.toString() === context.device.privateData, 'IDs match')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('PUT /api/deviceprivatedata/:id', () => {
    it('should not update model if token is invalid', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/deviceprivatedata/${context.device.privateData}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer 1`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        }
      }
    })

    it('should return 401 for normal user', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/deviceprivatedata/${context.device.privateData}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.userToken}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        }
      }
    })

    it('should throw 404 if model doesn\'t exist', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/deviceprivatedata/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.adminToken}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 404) {
          assert(err.statusCode === 404, 'Error code 404 expected.')
        }
      }
    })

    it('should update Device Private Data', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/deviceprivatedata/${context.device.privateData}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.adminToken}`
          },
          body: {
            devicePrivateData: { deviceUserName: 'hasChanged' }
          }
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.devicePrivateData.deviceUserName === 'hasChanged', 'deviceUserName is updated')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })
})
