/*
  Dev Note: CT 3/11/18
  This controller for the port control may be better as a module library instead
  of an API. Right now, only the client API uses it. If no other areas of the system
  use this API, then it would be better/more secure as a module library.
*/

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
