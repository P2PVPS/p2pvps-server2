/*
export default {
  session: 'secret-boilerplate-token',
  token: 'secret-jwt-token',
  database: 'mongodb://localhost:27017/p2pvps-server-dev'
}
*/

module.exports = {
  session: 'secret-boilerplate-token',
  token: 'secret-jwt-token',

  // Used for local development.
  database: 'mongodb://localhost:27017/p2pvps-server-dev'

  // Used for connecting to MongoDB in a Docker container.
  // database: 'mongodb://172.17.0.1:3500/p2pvps-server-dev'
}
