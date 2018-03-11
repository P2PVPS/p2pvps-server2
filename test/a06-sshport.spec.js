const app = require('../bin/server')
const supertest = require('supertest')
// const { expect, should } = require('chai')
const expect = require('chai').expect
const should = require('chai').should
const cleanDb = require('./utils').cleanDb
const utils = require('./utils.js')
const rp = require('request-promise')
const assert = require('chai').assert

should()
const request = supertest.agent(app.listen())
const context = {}

describe('SSH Ports', () => {
  before(async () => {
    // Login as a test user and get a JWT.
    const config = await utils.loginTestUser()

    // Create a new device.
    // const device = await utils.createDevice(config)

    // Initialize the context object.
    context.token = config.token
    context.user = config.test
    context.userId = config.id
    // context.deviceId = device._id.toString()
    // context.privateDataId = device.privateData
    // context.deviceData = device
  })

  describe('POST /sshport', () => {
    it('First call should return port 6000', (done) => {
      request
        .post('/sshport')
        .set({
          Accept: 'application/json'
        })
        .send({})
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          context.sshPort = res.body.sshPort.port
          console.log(`context.sshPort: ${JSON.stringify(context.sshPort, null, 2)}`)

          res.body.should.have.property('sshPort')
          res.body.sshPort.should.have.property('username')
          res.body.sshPort.should.have.property('password')
          assert(res.body.sshPort.port === 6000, 'First port should be 6000')

          done()
        })
    })

    it('Second call should return port 6001', (done) => {
      request
        .post('/sshport')
        .set({
          Accept: 'application/json'
        })
        .send({})
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.should.have.property('sshPort')
          res.body.sshPort.should.have.property('username')
          res.body.sshPort.should.have.property('password')
          assert(res.body.sshPort.port === 6001, 'Second port should be 6001')

          done()
        })
    })
  })

  describe('DELETE /sshport/:id', () => {
    it('should throw 404 if sshport is not being used', (done) => {
      // const { token } = context
      request
        .delete('/sshport/1')
        .set({
          Accept: 'application/json'
          // Authorization: `Bearer ${token}`
        })
        .expect(404, done)
    })

    it('should throw 404 non-numerical id', (done) => {
      // const { token } = context
      request
        .delete('/sshport/abc')
        .set({
          Accept: 'application/json'
          // Authorization: `Bearer ${token}`
        })
        .expect(404, done)
    })

    it('should release port', (done) => {
      request
        .delete(`/sshport/${context.sshPort}`)
        .set({
          Accept: 'application/json'
          // Authorization: `Bearer ${context.token}`
        })
        .expect(200, done)
    })
  })
})
