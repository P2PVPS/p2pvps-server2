/*
  This file contains all the tests for the devicePublicData model.

  TODO:
  Tests for register():
  -should reject with 404 if device does not exist.
  -Any user-specified checkinTimeStamp value is ignored.
  -Any user-specified expiration value is ignored.
  -devicePublicData model has the expiration updated.
  -devicePublicData model statistics get updated
  -devicePrivateModel is updated with login details
  -moneyPending and moneyOwed are updated
  -Previously reserved port(s) are released.
  -A new obContract model is created.
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

        //console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(result.statusCode === 200, 'Returned status of 200 expected.')
        assert(expiration.getTime() >= testStartTime.getTime(), 'Expiratioin date should be greater than now.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

  // End Describe
  })
})
