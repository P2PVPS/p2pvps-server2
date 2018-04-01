const mongoose = require('mongoose')

const RentedDevices = new mongoose.Schema({
  deviceList: []
})

module.exports = mongoose.model('rentedDevices', RentedDevices)
