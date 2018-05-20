const User = require('../models/users')
const config = require('../../config')
const getToken = require('../utils/auth')
const jwt = require('jsonwebtoken')

async function ensureUser (ctx, next) {
  // console.log(`getToken: ${typeof (getToken)}`)
  const token = getToken(ctx)

  if (!token) {
    // console.log(`Err: Token not provided.`)
    ctx.throw(401)
  }

  let decoded = null
  try {
    // console.log(`token: ${JSON.stringify(token, null, 2)}`)
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)
    decoded = jwt.verify(token, config.token)
  } catch (err) {
    // console.log(`Err: Token could not be decoded: ${err}`)
    ctx.throw(401)
  }

  ctx.state.user = await User.findById(decoded.id, '-password')
  if (!ctx.state.user) {
    // console.log(`Err: Could not find user.`)
    ctx.throw(401)
  }

  return next()
}

// This funciton is almost identical to ensureUser, except at the end, it verifies
// that the 'type' associated with the user equals 'admin'.
async function ensureAdmin (ctx, next) {
  // console.log(`getToken: ${typeof (getToken)}`)
  const token = getToken(ctx)

  if (!token) {
    // console.log(`Err: Token not provided.`)
    ctx.throw(401)
  }

  let decoded = null
  try {
    // console.log(`token: ${JSON.stringify(token, null, 2)}`)
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)
    decoded = jwt.verify(token, config.token)
  } catch (err) {
    // console.log(`Err: Token could not be decoded: ${err}`)
    ctx.throw(401)
  }

  ctx.state.user = await User.findById(decoded.id, '-password')
  if (!ctx.state.user) {
    // console.log(`Err: Could not find user.`)
    ctx.throw(401)
  }

  if (ctx.state.user.type !== 'admin') {
    ctx.throw(401, 'not admin')
  }

  return next()
}

// This middleware ensures that the :id used in the API endpoint matches the
// the ID used in the JWT, or failing that, the ID used in the JWT matches
// an Admin user. This prevents situations like users updating other users
// profiles or non-admins deleting users.
// TODO Tests must be developed before developing this function.
async function ensureTargetUserOrAdmin (ctx, next) {
  // console.log(`getToken: ${typeof (getToken)}`)
  const token = getToken(ctx)

  if (!token) {
    // console.log(`Err: Token not provided.`)
    ctx.throw(401)
  }

  let decoded = null
  try {
    // console.log(`token: ${JSON.stringify(token, null, 2)}`)
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)
    decoded = jwt.verify(token, config.token)
  } catch (err) {
    // console.log(`Err: Token could not be decoded: ${err}`)
    ctx.throw(401)
  }

  ctx.state.user = await User.findById(decoded.id, '-password')
  if (!ctx.state.user) {
    // console.log(`Err: Could not find user.`)
    ctx.throw(401)
  }

  if (ctx.state.user.type !== 'admin') {
    ctx.throw(401, 'not admin')
  }

  return next()
}

module.exports = {
  ensureUser,
  ensureAdmin,
  ensureTargetUserOrAdmin
}
