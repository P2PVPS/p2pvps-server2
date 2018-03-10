/*
  This file contains all the tests for the devicePublicData model.

  TODO:
  Tests for register():
  -Any user-specified checkinTimeStamp value is ignored.
  -Any user-specified expiration value is ignored.
  -A new obContract model is created.

  These tests can not be implemented because there is no devicePrivateData API.
  May be possible with additional API functionality.
  register():
  -devicePrivateModel is updated with login details
  -moneyPending and moneyOwed are updated
  -Previously reserved port(s) are released.
*/

const app = require('../bin/server')
const supertest = require('supertest')
const should = require('chai').should
const rp = require('request-promise')
const assert = require('chai').assert
const utils = require('./utils.js')

const LOCALHOST = 'http://localhost:5000'

should()
supertest.agent(app.listen())
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
  })

  describe('GET /register/:id', () => {
    it('should reject with 404 if device can not be found', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/client/register/1`,
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
          method: 'GET',
          uri: `${LOCALHOST}/client/register/${context.deviceId}`,
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

        const expiration = new Date(result.body.device.expiration)

        // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
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
          method: 'GET',
          uri: `${LOCALHOST}/client/register/${context.deviceId}`,
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
})
