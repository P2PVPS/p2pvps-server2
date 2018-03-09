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

    it('should auth user', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/auth`,
          resolveWithFullResponse: true,
          json: true,
          body: {
            username: 'test',
            password: 'pass'
          }
        }

        let result = await rp(options)

        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert(result.body.user.username === 'test', 'Username of test expected')
        assert(result.body.user.password === undefined, 'Password expected to be omited')
      } catch (err) {
        console.log('Error authenticating test user: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })
})
