const mongoose = require('mongoose')

const config = require('../../config')

// Connect to the Mongo Database.
mongoose.Promise = global.Promise
mongoose.connect(config.database)

const Device = require('../../src/models/deviceprivatedata')

async function getDevices () {
  const devices = await Device.find({})
  console.log(`device private models: ${JSON.stringify(devices, null, 2)}`)

  mongoose.connection.close()
}
getDevices()

module.exports = {
  getDevices
}
