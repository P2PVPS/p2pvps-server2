// const ensureUser = require('../../middleware/validators')
const client = require('./controller')

module.exports.baseUrl = '/api/client'

module.exports.routes = [
  {
    method: 'POST',
    route: '/register/:id',
    handlers: [
      client.register
    ]
  },
  {
    method: 'GET',
    route: '/checkin/:id',
    handlers: [
      client.checkIn
    ]
  },
  {
    method: 'GET',
    route: '/expiration/:id',
    handlers: [
      client.getExpiration
    ]
  }

]
