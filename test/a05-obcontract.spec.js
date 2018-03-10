const app = require('../bin/server')
const supertest = require('supertest')
// const { expect, should } = require('chai')
const expect = require('chai').expect
const should = require('chai').should
const cleanDb = require('./utils').cleanDb
const utils = require('./utils.js')

should()
const request = supertest.agent(app.listen())
const context = {}

describe('Users', () => {
  before(async () => {
    // Login as a test user and get a JWT.
    const config = await utils.loginTestUser()

    // Create a new device.
    const device = await utils.createDevice(config)

    // Initialize the context object.
    context.token = config.token
    context.user = config.test
    context.userId = config.id
    context.deviceId = device._id.toString()
    context.privateDataId = device.privateData
    context.deviceData = device
  })

  describe('POST /obcontract', () => {
    it('should not create contract if token is invalid', (done) => {
      request
        .post('/obcontract')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .send({ obContract:
        {
          ownerUser: context.userId,
          clientDevice: context.deviceId,
          title: 'test',
          description: 'test description'
        }
        })
        .expect(401, done)
    })

    it('should not create contract when data is incomplete', (done) => {
      request
        .post('/obcontract')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`
        })
        .send({ obContract: { ownerUser: context.userId } })
        .expect(422, done)
    })

    it('should create new obContract model', (done) => {
      request
        .post('/obcontract')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`
        })
        .send({ obContract:
        {
          ownerUser: context.userId,
          clientDevice: context.deviceId,
          title: 'test',
          description: 'test description'
        }
        })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.obContract.should.have.property('ownerUser')
          res.body.obContract.title.should.equal('test')

          context.obContractId = res.body.obContract._id.toString()

          done()
        })
    })
  })

  describe('GET /obcontract', () => {
    it('should fetch all contracts', (done) => {
      request
        .get('/obcontract')
        .set({
          Accept: 'application/json'
        })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.should.have.property('obContracts')

          res.body.obContracts.should.have.length(1)

          done()
        })
    })
  })

  describe('GET /obcontract/:id', () => {
    it('should throw 404 if contract doesn\'t exist', (done) => {
      const { token } = context
      request
        .get('/obcontract/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
    })

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
  })

  describe('PUT /obcontract/:id', () => {
    it('should not update contract if token is invalid', (done) => {
      request
        .put('/obcontract/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
    })

    it('should throw 404 if contract doesn\'t exist', (done) => {
      const { token } = context
      request
        .put('/obcontract/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
    })

    it('should update contract', (done) => {
      request
        .put(`/obcontract/${context.obContractId}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`
        })
        .send({ obContract: { title: 'hasChanged' } })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.obContract.should.have.property('title')
          res.body.obContract.title.should.equal('hasChanged')

          done()
        })
    })
  })

  describe('DELETE /obcontract/:id', () => {
    it('should not delete contract if token is invalid', (done) => {
      request
        .delete('/obcontract/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
    })

    it('should throw 404 if contract doesn\'t exist', (done) => {
      const { token } = context
      request
        .delete('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
    })

    it('should delete contract', (done) => {

      request
        .delete(`/obcontract/${context.obContractId}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`
        })
        .expect(200, done)
    })
  })
})
