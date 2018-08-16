const mongoose = require('mongoose')

const DevicePrivateData = new mongoose.Schema({
  ownerUser: { type: String, required: true },
  publicData: { type: String, required: true },
  renterUser: { type: String },
  serverSSHPort: { type: String },
  deviceUserName: { type: String },
  devicePassword: { type: String },
  dashId: { type: String },
  jumperState: {type: Boolean},
  moneyPending: { type: Number },
  moneyOwed: { type: Number },
  payments: { type: Array }
})

module.exports = mongoose.model('devicePrivateModel', DevicePrivateData)
