const app = require('../bin/server')
const supertest = require('supertest')
const should = require('chai').should
// const cleanDb = require('./utils').cleanDb
// const authUser = require('./utils').authUser
const utils = require('./utils')
const rp = require('request-promise')
const assert = require('chai').assert
const serverUtil = require('../bin/util')

should()
const request = supertest.agent(app.listen())
const context = {}

const LOCALHOST = 'http://localhost:5000'

describe('Auth', () => {
  before(async () => {
    utils.cleanDb()

    const userObj = {
      username: 'test',
      password: 'pass'
    }
    const testUser = await utils.createUser(userObj)

    context.user = testUser.user
    context.token = testUser.token

    //const success = await serverUtil.createSystemUser()
    //if (success) console.log(`System admin user created.`)
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
