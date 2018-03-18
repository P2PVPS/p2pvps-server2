// const ensureUser = require('../../middleware/validators')
const client = require('./controller')

module.exports.baseUrl = '/client'

module.exports.routes = [
  {
    method: 'GET',
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
  }
]
