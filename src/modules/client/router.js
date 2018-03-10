// const ensureUser = require('../../middleware/validators')
const client = require('./controller')

module.exports.baseUrl = '/client'

module.exports.routes = [
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      client.register
    ]
  }
]
