/*
  Tests for the devicePrivateData model

  Dev Note 3/12/18:
  Thought about adding these two tests to the PUT API:
    Assert the ownerUser has not changed.
    Assert the publicData has not changed.
  But since this is a private API for admins, maybe I don't want to enforce that?
*/

// const app = require('../bin/server')
// const supertest = require('supertest')
// const { expect, should } = require('chai')
// const expect = require('chai').expect
// const should = require('chai').should
// const cleanDb = require('./utils').cleanDb
const utils = require('./utils.js')
const rp = require('request-promise')
const assert = require('chai').assert
const serverUtil = require('../bin/util')

const LOCALHOST = 'http://localhost:5000'

// should()
// const request = supertest.agent(app.listen())
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
    it('should throw 404 if contract doesn\'t exist', async () => {
      try {
        const options = {
          method: 'GET',
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
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
      /*
      request
        .get('/deviceprivatedata/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminToken}`
        })
        .expect(404, done)
      */
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
      /*
      request
        .get(`/deviceprivatedata/${context.device.privateData}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.userToken}`
        })
        .expect(401, done)
      */
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
/*
      request
        .get(`/deviceprivatedata/${context.device.privateData}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminToken}`
        })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.should.have.property('devicePrivateData')
          assert(res.body.devicePrivateData._id.toString() === context.device.privateData, 'IDs match')
          // console.log(`res.body: ${JSON.stringify(res.body, null, 2)}`)

          done()
        })
*/
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
/*
      request
        .put('/deviceprivatedata/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
      */
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
      /*
      request
        .put(`/deviceprivatedata/${context.device.privateData}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.userToken}`
        })
        .expect(401, done)
      */
    })

    it('should throw 404 if contract doesn\'t exist', async () => {
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
/*
      request
        .put('/api/deviceprivatedata/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminToken}`
        })
        .expect(404, done)
      */
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

        //console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.devicePrivateData.deviceUserName === 'hasChanged', 'deviceUserName is updated')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
/*
      request
        .put(`/api/deviceprivatedata/${context.device.privateData}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminToken}`
        })
        .send({ devicePrivateData: { deviceUserName: 'hasChanged' } })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          // console.log(`res.body: ${JSON.stringify(res.body, null, 2)}`)

          res.body.devicePrivateData.should.have.property('deviceUserName')
          res.body.devicePrivateData.deviceUserName.should.equal('hasChanged')

          done()
        })
      */
    })
  })
})
