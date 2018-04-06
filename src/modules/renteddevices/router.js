/*

*/

// const ensureUser = require('../../middleware/validators')
const renteddevices = require('./controller')

// export const baseUrl = '/users'
module.exports.baseUrl = '/api/renteddevices'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      renteddevices.addDevice
    ]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      // ensureUser,
      renteddevices.getDevices
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      renteddevices.removeDevice
    ]
  }
]
