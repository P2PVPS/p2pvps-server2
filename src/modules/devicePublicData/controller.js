const DevicePublicData = require('../../models/devicepublicdata')
const DevicePrivateData = require('../../models/deviceprivatedata')

/**
 * @api {post} /devicePublicData Create a devicePublicData model
 * @apiPermission
 * @apiVersion 1.0.0
 * @apiName CreateDevice
 * @apiGroup Devices
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "device": { "ownerUser": "user._id", ... } }' localhost:5000/devices
 *
 * @apiParam {Object} device          Device object (required)
 * @apiParam {String} device.ownerUser GUID of the User who owns this device.
 * @apiParam {String} device.renterUser GUID of the User who rents this device.
 * @apiParam {String} device.privateData GUID of the devicePrivateData model associated with this device.
 * @apiParam {String} device.obContract GUID of the obContract model associated with this device.
 * @apiParam {String} device.rentStartDate An ISO date string of when the rental started.
 * @apiParam {String} device.expiration An ISO date string of when the device should reset.
 * @apiParam {String} device.deviceName Name displayed in the GUI.
 *
 * @apiSuccess {Object}   device          Device object
 * @apiSuccess {ObjectId} device._id      Device GUID
 * @apiSuccess {String}   device.ownerUser GUID of the User who owns this device.
 * @apiSuccess {String}   device.renterUser GUID of the User who rents this device.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "device": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "ownerUser": "56bd1da600a526986cf65c81"
 *          "renterUser": ""
 *       }
 *     }
 *
 * @apiError UnprocessableEntity Missing required parameters
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "status": 422,
 *       "error": "Unprocessable Entity"
 *     }
 */
async function createDevice (ctx) {
  // console.log('Current user: ' + JSON.stringify(ctx.state.user, null, 2))

  // The user creating the model is automatically assigned as the owner.
  // Override any user-assigned value.
  ctx.request.body.device.ownerUser = ctx.state.user._id

  // Create the devicePublicData model
  const device = new DevicePublicData(ctx.request.body.device)

  // Point the private model at the public model.
  //console.log(`device: ${JSON.stringify(device, null, 2)}`)
  const privateData = {
    ownerUser: ctx.state.user._id,
    publicData: device._id.toString()
  }

  // Create the devicePrivateData model.
  const devicePrivateData = new DevicePrivateData(privateData)

  // Point the public model at the private model.
  device.privateData = devicePrivateData._id.toString();



  // Save the devicePublicData model.
  try {
    await device.save()
  } catch (err) {
    ctx.throw(422, err.message)
  }

  // Save the devicePrivateData model.

  // const token = user.generateToken()
  const response = device.toJSON()

  ctx.body = {
    device: response
  }
}

/**
 * @api {get} /users Get all users
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/users
 *
 * @apiSuccess {Object[]} users           Array of user objects
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.name      User name
 * @apiSuccess {String}   users.username  User username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "users": [{
 *          "_id": "56bd1da600a526986cf65c80"
 *          "name": "John Doe"
 *          "username": "johndoe"
 *       }]
 *     }
 *
 * @apiUse TokenError
 */
async function getDevices (ctx) {
  const devices = await DevicePublicData.find({})
  ctx.body = { devices }
}

/**
 * @api {get} /users/:id Get user by id
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/users/56bd1da600a526986cf65c80
 *
 * @apiSuccess {Object}   users           User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.name      User name
 * @apiSuccess {String}   users.username  User username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "name": "John Doe"
 *          "username": "johndoe"
 *       }
 *     }
 *
 * @apiUse TokenError
 */
async function getDevice (ctx, next) {
  try {
    const device = await DevicePublicData.findById(ctx.params.id)
    if (!device) {
      ctx.throw(404)
    }

    ctx.body = {
      device
    }
  } catch (err) {
    if (err === 404 || err.name === 'CastError') {
      ctx.throw(404)
    }

    ctx.throw(500)
  }

  if (next) { return next() }
}

/**
 * @api {put} /users/:id Update a user
 * @apiPermission
 * @apiVersion 1.0.0
 * @apiName UpdateUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X PUT -d '{ "user": { "name": "Cool new Name" } }' localhost:5000/users/56bd1da600a526986cf65c80
 *
 * @apiParam {Object} user          User object (required)
 * @apiParam {String} user.name     Name.
 * @apiParam {String} user.username Username.
 *
 * @apiSuccess {Object}   users           User object
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.name      Updated name
 * @apiSuccess {String}   users.username  Updated username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "name": "Cool new name"
 *          "username": "johndoe"
 *       }
 *     }
 *
 * @apiError UnprocessableEntity Missing required parameters
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 422 Unprocessable Entity
 *     {
 *       "status": 422,
 *       "error": "Unprocessable Entity"
 *     }
 *
 * @apiUse TokenError
 */
async function updateDevice (ctx) {
  // console.log(`ctx.body: ${JSON.stringify(ctx.body, null, 2)}`)
  const device = ctx.body.device

  // Reject update if the user is not the device owner.
  if (device.ownerUser.toString() !== ctx.state.user._id.toString()) {
    console.log('Non-Device User tryint to change Device model!')
    console.log(`Current device owner: ${device.ownerUser}`)
    console.log(`Current user: ${ctx.state.user._id}`)
    ctx.throw(401, 'Only device owners can edit device details.')
  }

  // The user creating the model is automatically assigned as the owner.
  // Override an user-assigned value.
  ctx.request.body.device.ownerUser = ctx.state.user._id

  // TODO Ensure the privateData field is not changed.

  // Update the devicePublicData model.
  Object.assign(device, ctx.request.body.device)

  await device.save()

  ctx.body = {
    device
  }
}

/**
 * @api {delete} /users/:id Delete a user
 * @apiPermission
 * @apiVersion 1.0.0
 * @apiName DeleteUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X DELETE localhost:5000/users/56bd1da600a526986cf65c80
 *
 * @apiSuccess {StatusCode} 200
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true
 *     }
 *
 * @apiUse TokenError
 */

async function deleteDevice (ctx) {
  const device = ctx.body.device

  await device.remove()

  ctx.status = 200
  ctx.body = {
    success: true
  }
}

module.exports = {
  createDevice,
  getDevices,
  getDevice,
  updateDevice,
  deleteDevice
}
