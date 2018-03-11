const mongoose = require('mongoose')

const SSHPorts = new mongoose.Schema({
  usedPorts: []
})

module.exports = mongoose.model('sshPorts', SSHPorts)
