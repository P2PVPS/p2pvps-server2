const mongoose = require('mongoose')
// import bcrypt from 'bcrypt'
// import config from '../../config'
// import jwt from 'jsonwebtoken'

const DevicePublicData = new mongoose.Schema({
  ownerUser: { type: String, required: true },
  renterUser: { type: String },
  privateData: { type: String },
  obContract: { type: String },
  rentStartDate: { type: String },
  expiration: { type: String }, // Date client should be reset.
  deviceName: { type: String },
  deviceDesc: { type: String },
  rentHourlyRate: { type: String },
  subdomain: { type: String },
  httpPort: { type: String },
  sshPort: { type: String },
  memory: { type: String },
  diskSpace: { type: String },
  processor: { type: String },
  internetSpeed: { type: String },
  checkinTimeStamp: { type: String }
})

/*
DevicePublicData.methods.validatePassword = function validatePassword (password) {
  const user = this

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) { return reject(err) }

      resolve(isMatch)
    })
  })
}

DevicePublicData.methods.generateToken = function generateToken () {
  const user = this

  return jwt.sign({ id: user.id }, config.token)
}
*/

//export default mongoose.model('devicePublicModel', DevicePublicData)
module.exports = mongoose.model('devicePublicModel', DevicePublicData)
