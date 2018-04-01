const should = require('chai').should
const utils = require('./utils.js')
const rp = require('request-promise')
const assert = require('chai').assert

const LOCALHOST = 'http://localhost:5000'

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
  })

  describe('POST /api/sshport', () => {
    it('First call should return port 6000', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/sshport`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)
        context.sshPort = result.body.sshPort.port

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert.property(result.body.sshPort, 'username', 'Has property username.')
        assert.property(result.body.sshPort, 'password', 'Has property password.')
        assert(result.body.sshPort.port === 6000, 'First port should be 6000')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

    it('Second call should return port 6001', async () => {
      try {
        const options = {
          method: 'POST',
          uri: `${LOCALHOST}/api/sshport`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
          }
        }

        let result = await rp(options)

        // console.log(`Users: ${JSON.stringify(result, null, 2)}`)

        assert(result.statusCode === 200, 'Status Code 200 expected.')
        assert.property(result.body.sshPort, 'username', 'Has property username.')
        assert.property(result.body.sshPort, 'password', 'Has property password.')
        assert(result.body.sshPort.port === 6001, 'First port should be 6001')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })
  })

  describe('DELETE /api/sshport/:id', () => {
    it('should throw 404 if sshport is not being used', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/sshport/1`,
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
    })

    it('should throw 404 non-numerical id', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/sshport/abc`,
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
    })

    it('should release port', async () => {
      try {
        const options = {
          method: 'DELETE',
          uri: `${LOCALHOST}/api/sshport/${context.sshPort}`,
          resolveWithFullResponse: true,
          json: true,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          body: {
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
    })
  })
})
