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
  })

  describe('GET /deviceprivatemodel/:id', () => {
    it('should throw 404 if contract doesn\'t exist', (done) => {
      request
        .get('/deviceprivatemodel/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.adminToken}`
        })
        .expect(404, done)
    })
/*
    it('should fetch contract', (done) => {
      request
        .get(`/obcontract/${context.obContractId}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`
        })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.should.have.property('obContract')

          done()
        })
    })
    */
  })
})
