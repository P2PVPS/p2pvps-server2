const app = require('../bin/server')
const supertest = require('supertest')
// const { expect, should } = require('chai')
const expect = require('chai').expect
const should = require('chai').should
// const { cleanDb, authUser } = require('./utils')
const cleanDb = require('./utils').cleanDb
const authUser = require('./utils').authUser
const rp = require('request-promise')
const assert = require('chai').assert

should()
const request = supertest.agent(app.listen())
const context = {}

const LOCALHOST = 'http://localhost:5000'

describe('Auth', () => {
  before((done) => {
    cleanDb()
    authUser(request, (err, { user, token }) => {
      if (err) { return done(err) }

      context.user = user
      context.token = token
      console.log(`User created.`)
      done()
    })
  })

  describe('POST /auth', () => {
    it('should throw 401 if credentials are incorrect', (done) => {
      request
        .post('/auth')
        .set('Accept', 'application/json')
        .send({ username: 'supercoolname', password: 'wrongpassword' })
        .expect(401, done)
    })

    it('should auth user', async (done) => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/auth`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            user: {
              username: 'test',
              password: 'pass'
            }
          }
        }

        let result = await rp(options)

        // context.user = result.body.user
        // context.token = result.body.token

        // console.log(`user: ${JSON.stringify(context.user, null, 2)}`)
        // console.log(`token: ${JSON.stringify(context.token, null, 2)}`)
        assert(result.statusCode === 200, 'Status Code 200 expected.')
      } catch (err) {
        console.log('Error authenticating test user: ' + JSON.stringify(err, null, 2))
        throw err
      }
/*
      request
        .post('/auth')
        .set('Accept', 'application/json')
        .send({ username: 'test', password: 'pass' })
        .expect(200, (err, res) => {
          if (err) { return done(err) }

          res.body.user.should.have.property('username')
          res.body.user.username.should.equal('test')
          expect(res.body.user.password).to.not.exist

          context.user = res.body.user
          context.token = res.body.token

          done()
        })
        */
    })
  })
})
