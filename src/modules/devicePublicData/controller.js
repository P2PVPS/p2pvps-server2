const DevicePublicData = require('../../models/devicepublicdata')
const DevicePrivateData = require('../../models/deviceprivatedata')
const SSH = require('../sshport')

/**
 * @api {post} /api/devices Create a new device
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName CreateDevice
 * @apiGroup Device-Public
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X POST -d '{ "device": {} }' localhost:5000/api/devices
 *
 * @apiParam {Object} device                Device object (required)
 * @apiParam {ObjectId} device.ownerUser      GUID of the User who owns this device.
 * @apiParam {ObjectId} device.renterUser     GUID of the User who rents this device.
 * @apiParam {ObjectId} device.privateData    GUID of the devicePrivateData model associated with this device.
 * @apiParam {ObjectId} device.obContract     GUID of the obContract model associated with this device.
 * @apiParam {String} device.rentStartDate  An ISO date string of when the rental started.
 * @apiParam {String} device.expiration     An ISO date string of when the device should reset.
 * @apiParam {String} device.deviceName     Name displayed in the GUI.
 *
 * @apiSuccess {Object}   device              Device object
 * @apiSuccess {ObjectId} device._id          Device GUID
 * @apiSuccess {ObjectId} device.ownerUser    GUID of the User who owns this device.
 * @apiSuccess {ObjectId} device.privateData  GUID of the Private device model.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "device": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "ownerUser": "56bd1da600a526986cf65c81"
 *          "privateData": "5b0382a5eb56080a3d1b31b8"
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
  // console.log(`device: ${JSON.stringify(device, null, 2)}`)
  const privateData = {
    ownerUser: ctx.state.user._id,
    publicData: device._id.toString()
  }

  // Create the devicePrivateData model.
  const devicePrivateData = new DevicePrivateData(privateData)

  // Point the public model at the private model.
  device.privateData = devicePrivateData._id.toString()

  // Save the devicePublicData model.
  try {
    await device.save()
    await devicePrivateData.save()
  } catch (err) {
    ctx.throw(422, err.message)
  }

  // const token = user.generateToken()
  const response = device.toJSON()

  ctx.body = {
    device: response
  }
}

/**
 * @api {get} /api/devices Get all public device models
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName GetDevices
 * @apiGroup Device-Public
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/api/devices
 *
 * @apiSuccess {Object[]} devices               Array of device objects
 * @apiSuccess {ObjectId} devices._id           User id
 * @apiSuccess {ObjectId} devices.ownerUser     GUID of the User who owns this device.
 * @apiSuccess {ObjectId} devices.privateData   GUID of the Private device model.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "devices": [{
 *          "_id": "56bd1da600a526986cf65c80"
 *          "ownerUser": "5b038000eb56080a3d1b31b4"
 *          "privateData": "5b038287eb56080a3d1b31b6"
 *       }]
 *     }
 *
 */
async function getDevices (ctx) {
  const devices = await DevicePublicData.find({})
  ctx.body = { devices }
}

/**
 * @api {get} /api/devices/listbyid List devices by user
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName ListById
 * @apiGroup Device-Public
 *
 * @apiDescription List all devices associated with the calling user.
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X GET localhost:5000/api/devices/listbyid
 *
 * @apiSuccess {Object[]} devices              Array of device objects
 * @apiSuccess {ObjectId} devices._id          User id
 * @apiSuccess {ObjectId}   devices.ownerUser    User name
 * @apiSuccess {ObjectId}   devices.privateData  User username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "devices": [{
 *          "_id": "56bd1da600a526986cf65c80"
 *          "ownerUser": "5b038000eb56080a3d1b31b4"
 *          "privateData": "5b038287eb56080a3d1b31b6"
 *       }]
 *     }
 *
 * @apiUse TokenError
 */
// Get a list of devices associated with the current user.
async function listById (ctx) {
  const allDevices = await DevicePublicData.find({})

  const thisUser = ctx.state.user._id.toString()
  // console.log(`This user: ${thisUser}`)

  // Find the devices associated with the current user.
  const devices = []
  for (var i = 0; i < allDevices.length; i++) {
    const thisDevice = allDevices[i]
    // console.log(`thisDevice: ${JSON.stringify(thisDevice, null, 2)}`)

    if (thisDevice.ownerUser === thisUser) { devices.push(thisDevice) }
  }

  ctx.body = { devices }
}

/**
 * @api {get} /api/devices/:id Get single public device model
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName GetDevice
 * @apiGroup Device-Public
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/api/devices/56bd1da600a526986cf65c80
 *
 * @apiSuccess {Object[]} device                Public device object
 * @apiSuccess {ObjectId} device._id            User id
 * @apiSuccess {ObjectId} device.ownerUser      GUID of the User who owns this device.
 * @apiSuccess {ObjectId} device.privateData    GUID of the Private device model.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "device": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "ownerUser": "5b038000eb56080a3d1b31b4"
 *          "privateData": "5b038287eb56080a3d1b31b6"
 *       }
 *     }
 *
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
 * @api {put} /api/devices/:id Update a device
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName UpdateDevice
 * @apiGroup Device-Public
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X PUT -d '{ "device": { "deviceName": "My Device" } }' localhost:5000/api/devices/56bd1da600a526986cf65c80
 *
 * @apiParam {Object}   device                Device object (required)
 * @apiParam {ObjectId} device.ownerUser      GUID of the User who owns this device.
 * @apiParam {ObjectId} device.renterUser     GUID of the User who rents this device.
 * @apiParam {ObjectId} device.privateData    GUID of the devicePrivateData model associated with this device.
 * @apiParam {ObjectId} device.obContract     GUID of the obContract model associated with this device.
 * @apiParam {String}   device.rentStartDate  An ISO date string of when the rental started.
 * @apiParam {String}   device.expiration     An ISO date string of when the device should reset.
 * @apiParam {String}   device.deviceName     Name displayed in the GUI.
 *
 * @apiSuccess {Object}   device              Device object
 * @apiSuccess {ObjectId} device._id          Device GUID
 * @apiSuccess {ObjectId} device.ownerUser    GUID of the User who owns this device.
 * @apiSuccess {ObjectId} device.privateData  GUID of the Private device model.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "device": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "ownerUser": "5b038000eb56080a3d1b31b4"
 *          "privateData": "5b038287eb56080a3d1b31b6"
 *          "deviceName": "My Device"
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

  const isNotOwner = device.ownerUser.toString() !== ctx.state.user._id.toString()
  const isNotAdmin = ctx.state.user.type !== 'admin'

  // Reject update if the user is not the device owner.
  if (isNotOwner && isNotAdmin) {
    console.log('Non-Device User trying to change Device model!')
    console.log(`Current device owner: ${device.ownerUser}`)
    console.log(`Current user: ${ctx.state.user._id}`)
    ctx.throw(401, 'Only device owners can edit device details.')
  }

  // console.log(`ctx.request.body: ${JSON.stringify(ctx.request.body, null, 2)}`)
  // console.log(`device: ${JSON.stringify(device, null, 2)}`)

  // The user creating the model is automatically assigned as the owner.
  // Override any user-assigned value.
  // ctx.request.body.device.ownerUser = ctx.state.user._id
  // Above does not work with Listing Manager.
  // Override any attempt to reassignn the ownerUser.
  ctx.request.body.device.ownerUser = device.ownerUser

  // Override any attempt to reassign the privateData property.
  ctx.request.body.device.privateData = device.privateData

  // Update the devicePublicData model.
  Object.assign(device, ctx.request.body.device)

  // Clear obContract ID if passed value is blank.
  if (ctx.request.body.device.obContract === '') {
    // console.log(`removing obContract from device.`)
    device.obContract = ''
  }
  // console.log(`device before save: ${JSON.stringify(device, null, 2)}`)

  await device.save()

  // console.log(`device after save: ${JSON.stringify(device, null, 2)}`)

  ctx.body = {
    device
  }
}

/**
 * @api {delete} /api/devices/:id Delete a device
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName DeleteDevice
 * @apiGroup Device-Public
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X DELETE localhost:5000/api/devices/56bd1da600a526986cf65c80
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
  try {
  // console.log('Entered delteDevice()')
    const device = ctx.body.device

  // Reject if the request user is not the device owner.
    if (device.ownerUser !== ctx.state.user._id.toString()) {
      ctx.throw(401, 'Only device owners can delete devices.')
    }

  // Get the devicePrivateData model associated with this device.
    const devicePrivateData = await DevicePrivateData.findById(device.privateData)

    if (!devicePrivateData) {
      ctx.throw(404, 'Could not find the devicePrivateData model associated with this device.')
    }

  // TODO:
  // -Remove any obContracts (and store listings)
  // -Remove from rentedDevices list
    console.log(`device: ${JSON.stringify(device, null, 2)}`)
    console.log(`devicePrivateData: ${JSON.stringify(devicePrivateData, null, 2)}`)

  // Release the SSH port
    const port = devicePrivateData.serverSSHPort
    if (port) {
     await SSH.releasePort(port)
    }

    await device.remove()
    await devicePrivateData.remove()

    ctx.status = 200
    ctx.body = {
      success: true
    }
  } catch (err) {
    if (err === 500) {
      console.error(`Error in modules/devicePublicData/controller.js/deleteDevice(): `, err)
    }

    ctx.throw(err)
  }
}

module.exports = {
  createDevice,
  getDevices,
  listById,
  getDevice,
  updateDevice,
  deleteDevice
}
