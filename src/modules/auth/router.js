// import * as auth from './controller'
const auth = require('./controller')

// export const baseUrl = '/auth'
module.exports.baseUrl = '/api/auth'

// export default [
module.exports.routes = [
  {
    method: 'POST',
    route: '/',
    handlers: [
      auth.authUser
    ]
  }
]
