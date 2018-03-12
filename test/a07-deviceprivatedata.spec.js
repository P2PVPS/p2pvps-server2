const app = require('../bin/server')
const supertest = require('supertest')
// const { expect, should } = require('chai')
// const expect = require('chai').expect
const should = require('chai').should
// const cleanDb = require('./utils').cleanDb
const utils = require('./utils.js')
const rp = require('request-promise')
const assert = require('chai').assert

should()
const request = supertest.agent(app.listen())
const context = {}

describe('Device Private Model', () => {
  before(async () => {
    // Login as a test user and get a JWT.
    const config = await utils.loginTestUser()

    // Initialize the context object.
    context.userToken = config.token
    context.userUsername = config.test
    context.userId = config.id

    const adminUser = await utils.loginAdminUser()
    console.log(`adminUser: ${JSON.stringify(adminUser, null, 2)}`)
  })

  describe(`Dummy test`, () => {
    it(`dummy test`, () => {
      assert(true, 'yay!')
    })
  })
})
