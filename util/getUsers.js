import mongoose from 'mongoose'

import config from '../config'

// Connect to the Mongo Database.
mongoose.Promise = global.Promise
mongoose.connect(config.database)

import User from '../src/models/users'

async function getUsers () {
  const users = await User.find({}, '-password')
  console.log(`users: ${JSON.stringify(users, null, 2)}`)
}
getUsers()
