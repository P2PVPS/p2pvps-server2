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

const LOCALHOST = 'http://localhost:5000'

should()
const request = supertest.agent(app.listen())
const context = {}

describe('Client', () => {
  before((done) => {
    done()
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
  })
})
