// const ensureUser = require('../../middleware/validators')
const sshport = require('./controller')

// export const baseUrl = '/users'
module.exports.baseUrl = '/sshport'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      sshport.requestPort
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      sshport.releasePort
    ]
  }
]
