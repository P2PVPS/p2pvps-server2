/*
  This file contains all the tests for the devicePublicData model.

  TODO:
  -
  -A devicePrivateData model is associated with a devicePublidData model after creation.
  -A devicePublicData model is associated with a devicePrivateData model after creation.
  -Updating a devicePublicData does not change the privateData property.
  -Deleting a devicePublicData model can only be done by the ownerUser.
  -Deleting a devicePublicData model also deletes the devicePrivateData model.

*/

const app = require('../bin/server')
const supertest = require('supertest')
const should = require('chai').should
// import { authUser } from './utils'
const rp = require('request-promise')
const assert = require('chai').assert

const LOCALHOST = 'http://localhost:5000'

should()
const request = supertest.agent(app.listen())
const context = {}

describe('Devices', () => {
  before(async () => {
    // Create the 'good' user.
    try {
      const options = {
        method: 'POST',
        uri: `${LOCALHOST}/users`,
        resolveWithFullResponse: true,
        json: true,
        body: {
          user: {
            username: 'test',
            password: 'pass'
          }
        }
      }

      let result = await rp(options)

      context.user = result.body.user
      context.token = result.body.token

      // console.log(`user: ${JSON.stringify(context.user, null, 2)}`)
      // console.log(`token: ${JSON.stringify(context.token, null, 2)}`)
    } catch (err) {
      console.log('Error authenticating test user: ' + JSON.stringify(err, null, 2))
      throw err
    }

    // Create the 'bad' user.
    try {
      const options = {
        method: 'POST',
        uri: `${LOCALHOST}/users`,
        resolveWithFullResponse: true,
        json: true,
        body: {
          user: {
            username: 'baduser',
            password: 'pass'
          }
        }
      }

      let result = await rp(options)

      context.badUser = result.body.user
      context.badToken = result.body.token
    } catch (err) {
      console.log('Error authenticating "bad" test user: ' + JSON.stringify(err, null, 2))
      throw err
    }
  })

  describe('POST /devices', () => {
    it('should reject device creation when data is incomplete', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/devices`,
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
          uri: `${LOCALHOST}/devices`,
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
          uri: `${LOCALHOST}/devices`,
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
        assert(result.body.device.privateData !== 'test', 'Should return a GUID to a devicePrivateData model.')

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
          uri: `${LOCALHOST}/devices`,
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

  describe('GET /devices', () => {
    it('should not fetch devices if the authorization header is missing', (done) => {
      request
        .get('/devices')
        .set('Accept', 'application/json')
        .expect(401, done)
    })

    it('should not fetch devices if the authorization header is missing the scheme', (done) => {
      request
        .get('/devices')
        .set({
          Accept: 'application/json',
          Authorization: '1'
        })
        .expect(401, done)
    })

    it('should not fetch devices if the authorization header has invalid scheme', (done) => {
      const { token } = context
      request
        .get('/devices')
        .set({
          Accept: 'application/json',
          Authorization: `Unknown ${token}`
        })
        .expect(401, done)
    })

    it('should not fetch devices if token is invalid', (done) => {
      request
        .get('/devices')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
    })

    it('should fetch all devices', async () => {
      const { token } = context

      try {
        // console.log(`Token: ${token}`)

        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/devices`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        context.deviceId = result.body.devices[0]._id

        assert.isArray(result.body.devices, 'devices should be an array')
        assert(result.statusCode === 200, 'Status Code 200 expected')
      } catch (err) {
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('GET /devices/:id', () => {
    it('should not fetch user if token is invalid', (done) => {
      request
        .get('/devices/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
    })

    it('should throw 404 if device doesn\'t exist', (done) => {
      const { token } = context
      request
        .get('/devices/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
    })

    it('should fetch device', (done) => {
      const { token } = context

      request
        .get(`/devices/${context.deviceId}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          // console.log(`result: ${JSON.stringify(res, null, 2)}`)

          context.deviceModel = res.body.device

          res.body.should.have.property('device')

          // expect(res.body.user.password).to.not.exist

          done()
        })
    })
  })

  describe('PUT /devices/:id', () => {
    it('should not update device if token is invalid', (done) => {
      request
        .put('/devices/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
    })

    it('should throw 404 if device doesn\'t exist', (done) => {
      const { token } = context
      request
        .put('/devices/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
    })

    it('should update device', async () => {
      const { token } = context

      // console.log(`device model: ${JSON.stringify(context.deviceModel, null, 2)}`)

      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/devices/${context.deviceId}`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            device: {
              ownerUser: context.badUser._id,
              memory: 'hasBeenChanged'
            }
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(result.body.device.memory === 'hasBeenChanged', 'Should return the update data')

        // Updating a device model to another user ID fails, the ownerID value stays
        // on the user that created the model.
        assert(result.body.device.ownerUser === context.user._id, 'Should not update ownerUser')
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
          uri: `${LOCALHOST}/devices/${context.deviceId}`,
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
    it('should not delete device if token is invalid', (done) => {
      request
        .delete('/devices/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
    })

    it('should throw 404 if device doesn\'t exist', (done) => {
      const { token } = context
      request
        .delete('/devices/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
    })

    it('should delete device', (done) => {
      const { token } = context

      request
        .delete(`/devices/${context.deviceId}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(200, done)
    })
  })
})
