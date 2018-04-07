const mongoose = require('mongoose')

const config = require('../../config')

// Connect to the Mongo Database.
mongoose.Promise = global.Promise
mongoose.connect(config.database)

const Device = require('../../src/models/obcontract')

async function getContracts () {
  const contracts = await Device.find({})
  console.log(`contracts: ${JSON.stringify(contracts, null, 2)}`)

  mongoose.connection.close()
}
getContracts()

module.exports = {
  getContracts
}
