const app = require('../bin/server')
const supertest = require('supertest')
const should = require('chai').should
const utils = require('./utils.js')
const rp = require('request-promise')
const assert = require('chai').assert

const LOCALHOST = 'http://localhost:5000'

should()
// const request = supertest.agent(app.listen())
const context = {}

describe('obContract', () => {
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

  describe('POST /api/obcontract', () => {
    it('should not create contract when data is incomplete', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/obcontract`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
            obContract: { ownerUser: context.userId }
          }
        }

        let result = await rp(options)

          // console.log(`result: ${JSON.stringify(result, null, 2)}`)

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
      /*
      request
        .post('/obcontract')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`
        })
        .send({ obContract: { ownerUser: context.userId } })
        .expect(422, done)
      */
    })

    it('should create new obContract model', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/obcontract`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
            obContract: {
              ownerUser: context.userId,
              clientDevice: context.deviceId,
              title: 'test',
              description: 'test description'
            }
          }
        }

        let result = await rp(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        context.obContractId = result.body.obContract._id.toString()

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert.property(result.body.obContract, 'ownerUser', 'Has property ownerUser')
        assert.property(result.body.obContract, 'clientDevice', 'Has property clientDevice')
        assert.property(result.body.obContract, '_id', 'Has property _id')
        assert(result.body.obContract.title === 'test', 'Username of test expected')
        assert(result.body.obContract.ownerUser === context.userId, 'User ID expected')
        assert(result.body.obContract.clientDevice === context.deviceId, 'Device ID expected')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
      /*
      request
        .post('/obcontract')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`
        })
        .send({
          obContract: {
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
        */
    })
  })

  describe('GET /api/obcontract', () => {
    it('should fetch all contracts', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/obcontract`,
          resolveWithFullResponse: true,
          json: true
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert.property(result.body, 'obContracts', 'Has property obContracts')
        assert(result.body.obContracts.length, 1, 'Array has length of 1')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
      /*
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
      */
    })
  })

  describe('GET /api/obcontract/:id', () => {
    it('should throw 404 if contract doesn\'t exist', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/obcontract/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
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
      const { token } = context
      request
        .get('/api/obcontract/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
      */
    })

    it('should fetch contract', async () => {
      try {
        const options = {
          method: 'GET',
          uri: `${LOCALHOST}/api/obcontract/${context.obContractId}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert.property(result.body.obContract, 'ownerUser', 'Has property ownerUser')
        assert.property(result.body.obContract, 'clientDevice', 'Has property clientDevice')
        assert.property(result.body.obContract, '_id', 'Has property _id')
        assert(result.body.obContract.title === 'test', 'Username of test expected')
        assert(result.body.obContract.ownerUser === context.userId, 'User ID expected')
        assert(result.body.obContract.clientDevice === context.deviceId, 'Device ID expected')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
      /*
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
      */
    })
  })

  describe('PUT /obcontract/:id', () => {
    it('should not update contract if token is invalid', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/obcontract/${context.obContractId}`,
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
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
      /*
      request
        .put('/obcontract/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
      */
    })

    it('should throw 404 if contract doesn\'t exist', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/obcontract/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
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
      const { token } = context
      request
        .put('/obcontract/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
      */
    })

    it('should update contract', async () => {
      try {
        const options = {
          method: 'PUT',
          uri: `${LOCALHOST}/api/obcontract/${context.obContractId}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
            obContract: { title: 'hasChanged' }
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.obContract.title === 'hasChanged', 'Title is updated')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }

      /*
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
      */
    })
  })

  describe('DELETE /api/obcontract/:id', () => {
    it('should not delete contract if token is invalid', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/obcontract/${context.obContractId}`,
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
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }

      /*
      request
        .delete('/obcontract/1')
        .set({
          Accept: 'application/json',
          Authorization: 'Bearer 1'
        })
        .expect(401, done)
      */
    })

    it('should throw 404 if contract doesn\'t exist', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/obcontract/1`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
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
      const { token } = context
      request
        .delete('/users/1')
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        })
        .expect(404, done)
      */
    })

    it('should delete contract', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/obcontract/${context.obContractId}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
      /*
      request
        .delete(`/obcontract/${context.obContractId}`)
        .set({
          Accept: 'application/json',
          Authorization: `Bearer ${context.token}`
        })
        .expect(200, done)
      */
    })
  })
})
