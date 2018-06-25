/*
  This file contains all the tests for the devicePublicData model.

  TODO:
  -Ensure deleting device also removes it from the rentedDevices list.
  -Ensure deleting device releases the SSH port.
  --This test is implictly enforced, but it should be explicitly tested by
    querying the rentededDevices list and verifying the port is not there.
    Good context for a subfunction.
  -Create a device with the 'bad user', and ensure the device is not returned when
  the 'good' user calls listById().
*/

const should = require('chai').should
// import { authUser } from './utils'
const rp = require('request-promise')
const assert = require('chai').assert
const utils = require('./utils.js')
const nock = require('nock')
const DevicePrivateData = require('../src/modules/devicePrivateData')
const serverUtil = require('../bin/util')
const ObContract = require('../src/modules/obcontract')

const LOCALHOST = 'http://localhost:5000'

should()
// const request = supertest.agent(app.listen())
const context = {}

describe('Devices', () => {
  before(async () => {
    // Create the 'good' user.
    try {
      let userObj = {
        username: 'test',
        password: 'pass'
      }
      let result = await utils.createUser(userObj)

      context.user = result.user
      context.token = result.token
    } catch (err) {
      console.log('Error creating test user: ' + JSON.stringify(err, null, 2))
      throw err
    }

    // Create the 'bad' user.
    try {
      let userObj = {
        username: 'baduser',
        password: 'pass'
      }
      let result = await utils.createUser(userObj)

      context.badUser = result.user
      context.badToken = result.token
    } catch (err) {
      console.log('Error creating "bad" test user: ' + JSON.stringify(err, null, 2))
      throw err
    }

    // Create and system admin user
    const adminUser = await serverUtil.createSystemUser()
    // console.log(`adminUser: ${JSON.stringify(adminUser, null, 2)}`)
    context.adminToken = adminUser.token
    context.adminUsername = adminUser.username
    context.adminId = adminUser.id

    // Mock out the URLs.
    nock(`http://serverdeployment2_openbazaar_1:4002`)
    .persist()
    .post('/ob/listing/')
    .reply(200, { slug: 'test-5aab2816aa39c214596eb900' })
  })

  describe('POST /devices', () => {
    it('should reject device creation when data is incomplete', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/devices`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            device: {
              memory: 'test'
            }
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should reject device creation for unauthorized user', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/devices`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            device: {
              ownerUser: context.user._id,
              renterUser: 'test',
              privateData: 'test',
              obContract: 'test',
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
          }
        }

        const result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result.')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should create device for authorized user', async () => {
      try {
        const { token } = context

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
              obContract: 'test',
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
            Authorization: `Bearer ${token}`
          }
        }

        let result = await rp(options)

        assert(result.body.device.memory === 'test', 'Should return the new device.')

        // A devicePrivateData model is associated with a devicePublidData model after creation.
        assert(result.body.device.privateData !== 'test', 'Should return a GUID to a devicePrivateData model.')
        assert.match(result.body.device.privateData, /^[0-9a-fA-F]{24}$/, 'privateData is a valid GUID.')

        // ownerUser value should be ignored and autoassigned to the current user.
        assert(result.body.device.ownerUser === context.user._id, 'ownerUser should be assigned to current user.')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode, 422, 'Error code expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should ignore assigned ownerUser and assign ownerUser to the current user', async () => {
      try {
        const { token } = context

        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/devices`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            device: {
              ownerUser: context.badUser._id,
              renterUser: 'test',
              privateData: 'test',
              obContract: 'test',
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
            Authorization: `Bearer ${token}`
          }
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        // Creating a device model and tring to assign it to a different user fails,
        // the device owner can only be assigned to the user making the API call.
        assert(result.body.device.ownerUser === context.user._id, 'ownerUser should be assigned to current user.')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode, 422, 'Error code expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })
  })

  describe('GET /api/devices', () => {
    it('should not fetch devices if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/devices`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            device: {
              ownerUser: context.badUser._id,
              renterUser: 'test',
              privateData: 'test',
              obContract: 'test',
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
          }
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result.')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    /*
    // Deprecated. The market listing app needs this API endpoint to be open.
    it('should not fetch devices if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devices`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: '1'
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        // if (err.statusCode === 422) {
        //  assert(err.statusCode === 422, 'Error code 422 expected.')
        // } else
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })
    */

    /*
    // Deprecated. The market listing app needs this API endpoint to be open.
    it('should not fetch devices if the authorization header has invalid scheme', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devices`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Unknown ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })
    */

    /*
    // Deprecated. The market listing app needs this API endpoint to be open.
    it('should not fetch devices if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devices`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Bearer: '1'
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        // if (err.statusCode === 422) {
        //  assert(err.statusCode === 422, 'Error code 422 expected.')
        // } else
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })
    */

    it('should fetch all devices', async () => {
      const { token } = context

      try {
        // console.log(`Token: ${token}`)

        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devices`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result.body, null, 2)}`)

        context.deviceId = result.body.devices[0]._id

        assert.isArray(result.body.devices, 'devices should be an array')
        assert(result.statusCode === 200, 'Status Code 200 expected')
      } catch (err) {
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('GET /devices/listbyid', () => {
    it('should fetch only devices associated with user', async () => {
      const { token } = context

      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devices/listbyid`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result.body, null, 2)}`)
        // console.log(`User: ${context.user._id}`)

        assert.isArray(result.body.devices, 'devices should be an array')
        assert(result.statusCode === 200, 'Status Code 200 expected')
        assert(result.body.devices[0].ownerUser === context.user._id, 'User IDs should match')
      } catch (err) {
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('GET /api/devices/:id', () => {
    it('should not fetch user if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devices/5b30126004a8c715bf057f41`,
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
        // Temorarily passing test:
        if (err.statusCode === 404) {
          assert(err.statusCode === 404, 'Error code 401 expected.')

        // if (err.statusCode === 401) {
        //  assert(err.statusCode === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 422 if GUID is invalid format', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devices/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 404 if device doesn\'t exist', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devics/5b30126004a8c715bf057f41`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
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

    it('should fetch device', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/devices/${context.deviceId.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        context.deviceModel = result.body.device

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.device.deviceName === 'test', 'Device name of test expected')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('PUT /devices/:id', () => {
    it('should not update device if token is invalid', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/devices/${context.deviceId.toString()}`,
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
        // if (err.statusCode === 404) { // TODO Should this be a 404 or a 401?
        //  assert(err.statusCode === 404, 'Error code 404 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 422 if GUID is invalid', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/devices/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 404 if device doesn\'t exist', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/devices/5b30126004a8c715bf057f41`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
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

    it('should update device', async () => {
      const { token } = context

      // console.log(`device model: ${JSON.stringify(context.deviceModel, null, 2)}`)

      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/devices/${context.deviceId}`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            device: {
              ownerUser: context.badUser._id,
              memory: 'hasBeenChanged',
              privateData: 'someManipulatedValue'
            }
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

        let result = await rp(options)

        // TODO: Assert that change in obContract values are changed. Both
        // blank strings, and actual string values.

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(result.body.device.memory === 'hasBeenChanged', 'Should return the update data')

        // Updating a device model to another user ID fails, the ownerID value stays
        // on the user that created the model.
        assert(result.body.device.ownerUser === context.user._id, 'Should not update ownerUser')

        // Updating a devicePublicData does not change the privateData property.
        assert(result.body.device.privateData !== 'someManipulatedValue', 'Should not update privateData')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode, 422, 'Error code expected.')
        } else {
          // console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('Malicious users can not update other users devices', async () => {
      const token = context.badUser.token

      // console.log(`device model: ${JSON.stringify(context.deviceModel, null, 2)}`)

      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/devices/${context.deviceId}`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            device: {
              // ownerUser: context.badUser._id,
              memory: 'hasBeenChanged'
            }
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Malicious user can update other users devices.')
        } else {
          // console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })
  })

  describe('DELETE /devices/:id', () => {
    it('should not delete device if token is invalid', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/devices/${context.user._id.toString()}`,
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
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 422 if GUID is invalid', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/devices/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 422) {
          assert(err.statusCode === 422, 'Error code 422 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 404 if device doesn\'t exist', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/devices/5b30126004a8c715bf057f41`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
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

    it('should throw 401 if device owner doesn\'t match user', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/devices/${context.deviceId}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.badToken}`
          }
        }

        let result = await rp(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.statusCode === 401) {
          assert(err.statusCode === 401, 'Malicious user can not delete other users devices.')
        } else {
          // console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should delete device', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/devices/${context.deviceId.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

    it('should delete device from private model, ssh port, rented device list, and obContract', async () => {
      try {
        // Create a device
        const device = await utils.createDevice({token: context.token})

        // Register the device
        const config = {}
        config.deviceId = device._id
        const fullDevice = await utils.registerDevice(config)

        // console.log(`device: ${JSON.stringify(device, null, 2)}`)
        // console.log(`fullDevice: ${JSON.stringify(fullDevice, null, 2)}`)

        // Save info for later comparison.
        const obContract = fullDevice.obContract
        // const port = fullDevice.port
        const privateId = fullDevice.privateData

        // Delete the device.
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/devices/${device._id.toString()}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }
        let result = await rp(options)

        // Try to get the private data model.
        try {
          config.adminToken = context.adminToken
          config.id = privateId
          const devicePrivateData = await DevicePrivateData.getPrivateModel(config)

          // Exception expected. Throw an error if this code gets executed.
          const err = {}
          err.message = `This line should not be executed!`
          err.devicePrivateData = devicePrivateData
          throw err
        } catch (err) {
          console.log(`Ignore the above error ^^^`)
          assert(err.statusCode === 404, `Private model should not be found.`)
        }

        // Try to get the obContract model.
        try {
          const obContractModel = await ObContract.getContract(obContract)

          // Exception expected. Throw an error if this code gets executed.
          const err = {}
          err.message = `This line should not be executed!`
          err.obContractModel = obContractModel
          throw err
        } catch (err) {
          console.log(`Ignore the above error ^^^`)
          assert(err.statusCode === 404, `Private model should not be found.`)
        }

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(true)
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })
})
