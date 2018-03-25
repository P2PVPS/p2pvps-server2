const ensureUser = require('../../middleware/validators').ensureUser
const obContract = require('./controller')

// export const baseUrl = '/users'
module.exports.baseUrl = '/api/obcontract'

module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      ensureUser,
      obContract.createContract
    ]
  },
  {
    method: 'GET',
    route: '/',
    handlers: [
      obContract.getContracts
    ]
  },
  {
    method: 'GET',
    route: '/:id',
    handlers: [
      obContract.getContract
    ]
  },
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      ensureUser,
      obContract.getContract,
      obContract.updateContract
    ]
  },
  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      ensureUser,
      obContract.getContract,
      obContract.deleteContract
    ]
  }
]
