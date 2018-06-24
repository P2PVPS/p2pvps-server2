/*
  This file contains all the tests for the devicePublicData model.

  TODO:
  Tests for register():
  -A new obContract model is created.
  -Ensure any previous obContract model is deleted from the DB.
  -Returns username, password, and port for newly created shell.

  -Test code path for /client/expiration/:id when expiration has passed.

  register():
  -devicePrivateModel is updated with login details
  -moneyPending and moneyOwed are updated
  -Previously reserved port(s) are released.
*/

const rp = require('request-promise')
const assert = require('chai').assert
const utils = require('./utils.js')
const nock = require('nock')

const LOCALHOST = 'http://localhost:5000'

// supertest.agent(app.listen())
const context = {}

describe('Client', () => {
  before(async () => {
    // Login as a test user and get a JWT.
    const config = await utils.loginTestUser()
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)

    // Create a new device.
    const device = await utils.createDevice(config)
    // console.log(`device: ${JSON.stringify(device, null, 2)}`)

    // Initialize the context object.
    context.token = config.token
    context.user = config.test
    context.userId = config.id
    context.deviceId = device._id.toString()
    context.privateDataId = device.privateData
    context.deviceData = device

    // Mock out the URLs.
    nock(`http://serverdeployment2_openbazaar_1:4002`)
    .persist()
    .post('/ob/listing/')
    .reply(200, { slug: 'test-5aab2816aa39c214596eb900' })

    nock(`http://serverdeployment2_openbazaar_1:4002`)
    .persist()
    .delete('/ob/listing/test-5aab2816aa39c214596eb900')
    .reply(200, { })
  })

  describe('POST /api/register/:id', () => {
    it('should reject with 422 if GUID is invalid', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/client/register/1`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            memory: 'Fake Test Data',
            diskSpace: 'Fake Test Data',
            processor: 'Fake Test Data',
            internetSpeed: 'Fake Test Data'
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

    it('should reject with 404 if device can not be found', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/client/register/5b30126004a8c715bf057f41`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            memory: 'Fake Test Data',
            diskSpace: 'Fake Test Data',
            processor: 'Fake Test Data',
            internetSpeed: 'Fake Test Data'
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

    it('should register device', async () => {
      try {
        const testStartTime = new Date()

        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/client/register/${context.deviceId}`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            memory: 'Fake Test Data',
            diskSpace: 'Fake Test Data',
            processor: 'Fake Test Data',
            internetSpeed: 'Fake Test Data'
          }
        }

        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        const expiration = new Date(result.body.device.expiration)

        assert(result.statusCode === 200, 'Returned status of 200 expected.')

        // devicePublicData model has the expiration updated
        assert(expiration.getTime() >= testStartTime.getTime(), 'Expiratioin date should be greater than now.')

        // devicePublicData model statistics get updated
        assert(result.body.device.memory !== context.deviceData.memory, 'Memory statistics updated.')
        assert(result.body.device.diskSpace !== context.deviceData.diskSpace, 'Memory statistics updated.')
        assert(result.body.device.processor !== context.deviceData.processor, 'Memory statistics updated.')
        assert(result.body.device.internetSpeed !== context.deviceData.internetSpeed, 'Memory statistics updated.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

    it('should ignore user-specified checkinTimeStamp and expiration', async () => {
      try {
        const testStartTime = new Date()
        const twoMonths = 60000 * 60 * 24 * 60
        const twoMonthsFromNow = new Date(testStartTime.getTime() + twoMonths)

        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/client/register/${context.deviceId}`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            checkinTimeStamp: twoMonthsFromNow.toISOString(),
            expiration: twoMonthsFromNow.toISOString()
          }
        }

        let result = await rp(options)

        const expiration = new Date(result.body.device.expiration)
        const checkinTimeStamp = new Date(result.body.device.checkinTimeStamp)

        assert(expiration.getTime() < twoMonthsFromNow.getTime(), 'User specified expiration is ignored.')
        assert(checkinTimeStamp.getTime() < twoMonthsFromNow.getTime(), 'User specified checkinTimeStamp is ignored.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

  // End Describe
  })

  describe('GET /api/checkin/:id', () => {
    it('should reject with 422 if device can not be found', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/client/checkin/1`,
          resolveWithFullResponse: true,
          json: true
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

    it('should reject with 404 if device can not be found', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/client/checkin/5b144dc913ba390019291dc6`,
          resolveWithFullResponse: true,
          json: true
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

    it('should check in device', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/client/checkin/${context.deviceId}`,
          // resolveWithFullResponse: true,
          json: true
        }
        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(result.success, 'Should return true')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('GET /api/client/expiration/:id', () => {
    it('should reject with 404 if device can not be found', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/client/expiration/1`,
          resolveWithFullResponse: true,
          json: true
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

    it('should get expiration of device', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/client/expiration/${context.deviceId}`,
          // resolveWithFullResponse: true,
          json: true
        }
        let result = await rp(options)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

        assert(typeof (result.expiration) === 'string', 'Should return true')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })
})
