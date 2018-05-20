// const ensureUser = require('../../middleware/validators').ensureUser
const validator = require('../../middleware/validators')
const devicePublicData = require('./controller')

module.exports.baseUrl = '/api/devices'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      validator.ensureUser,
      devicePublicData.createDevice
    ]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      // ensureUser,
      devicePublicData.getDevices
    ]
  },
  {
    method: 'GET',
    route: '/listbyid',
    handlers: [
      validator.ensureUser,
      devicePublicData.listById
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      // ensureUser,
      devicePublicData.getDevice
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      // ensureUser,
      validator.ensureUser,
      devicePublicData.getDevice,
      devicePublicData.updateDevice
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      // ensureUser,
      validator.ensureUser,
      devicePublicData.getDevice,
      devicePublicData.deleteDevice
    ]
  }
]
