const ensureUser = require('../../middleware/validators')
const devicePublicData = require('./controller')

module.exports.baseUrl = '/devices'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      ensureUser,
      devicePublicData.createDevice
    ]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      ensureUser,
      devicePublicData.getDevices
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      ensureUser,
      devicePublicData.getDevice
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      ensureUser,
      devicePublicData.getDevice,
      devicePublicData.updateDevice
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      ensureUser,
      devicePublicData.getDevice,
      devicePublicData.deleteDevice
    ]
  }
]
