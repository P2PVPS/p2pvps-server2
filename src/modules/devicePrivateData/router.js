// const ensureAdmin = require('../../middleware/validators').ensureAdmin
const validators = require('../../middleware/validators')
const ensureAdmin = validators.ensureAdmin
const devicePrivateData = require('./controller')

module.exports.baseUrl = '/deviceprivatedata'

module.exports.routes = [
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      ensureAdmin,
      devicePrivateData.getModel
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      ensureAdmin,
      devicePrivateData.getModel,
      devicePrivateData.updateModel
    ]
  }
]
