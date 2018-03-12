const app = require('../bin/server')
const supertest = require('supertest')
// const { expect, should } = require('chai')
// const expect = require('chai').expect
const should = require('chai').should
// const cleanDb = require('./utils').cleanDb
const utils = require('./utils.js')
const rp = require('request-promise')
const assert = require('chai').assert
const serverUtil = require('../bin/util')

should()
const request = supertest.agent(app.listen())
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
    context.adminToken = adminUser.token
    context.adminUsername = adminUser.username
    context.adminId = adminUser.id

    // Create a device
    const device = await utils.createDevice({token: context.userToken})
    context.device = device
    console.log(`device: ${JSON.stringify(device, null, 2)}`)
  })

  describe('GET /deviceprivatedata/:id', () => {
    it('should throw 404 if contract doesn\'t exist', (done) => {
      request
        .get('/deviceprivatedata/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminToken}`
        })
        .expect(404, done)
    })

    it('should throw 401 for normal user', (done) => {
      request
        .get(`/deviceprivatedata/${context.device.privateData}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.userToken}`
        })
        .expect(401, done)
    })

    it('should fetch for admin user', (done) => {
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
          //console.log(`res.body: ${JSON.stringify(res.body, null, 2)}`)

          done()
        })
    })
  })
})
