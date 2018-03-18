/*
  Tests for the devicePrivateData model

  Dev Note 3/12/18:
  Thought about adding these two tests to the PUT API:
    Assert the ownerUser has not changed.
    Assert the publicData has not changed.
  But since this is a private API for admins, maybe I don't want to enforce that?
*/

const app = require('../bin/server')
const supertest = require('supertest')
// const { expect, should } = require('chai')
// const expect = require('chai').expect
const should = require('chai').should
// const cleanDb = require('./utils').cleanDb
const utils = require('./utils.js')
// const rp = require('request-promise')
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
    //console.log(`adminUser: ${JSON.stringify(adminUser, null, 2)}`)
    context.adminToken = adminUser.token
    context.adminUsername = adminUser.username
    context.adminId = adminUser.id

    // Create a device
    const device = await utils.createDevice({token: context.userToken})
    context.device = device
    // console.log(`device: ${JSON.stringify(device, null, 2)}`)
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
          // console.log(`res.body: ${JSON.stringify(res.body, null, 2)}`)

          done()
        })
    })
  })

  describe('PUT /deviceprivatedata/:id', () => {
    it('should not update model if token is invalid', (done) => {
      request
        .put('/deviceprivatedata/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
    })

    it('should return 401 for normal user', (done) => {
      request
        .put(`/deviceprivatedata/${context.device.privateData}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.userToken}`
        })
        .expect(401, done)
    })

    it('should throw 404 if contract doesn\'t exist', (done) => {
      request
        .put('/deviceprivatedata/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminToken}`
        })
        .expect(404, done)
    })

    it('should update contract', (done) => {
      request
        .put(`/deviceprivatedata/${context.device.privateData}`)
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
    })
  })
})
