const common = require('./env/common')

const env = process.env.P2PVPS_ENV || 'dev'
const config = require(`./env/${env}`)

module.exports = Object.assign({}, common, config)
