const DevicePublicData = require('../../models/devicepublicdata')
const DevicePrivateData = require('../../models/deviceprivatedata')
const sshPort = require('../sshport')
const util = require('../../lib/util')

/**
 * @api {get} /client/register/:id Register a client device on the marketplace
 * @apiPermission client
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Client
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/client/register/56bd1da600a526986cf65c80
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
// This API is called by Client device to register itself into the marketplace.
async function register (ctx, next) {
  // const DEFAULT_EXPIRATION = 60000 * 60 * 24 * 30; // Thirty Days
  const DEFAULT_EXPIRATION = 60000 * 60 * 24 // One Day
  // const DEFAULT_EXPIRATION = 60000 * 60; // One Hour
  // const DEFAULT_EXPIRATION = 60000 * 8; // Testing

  try {
    // console.log('register() called.')
    // console.log(`body data: ${JSON.stringify(ctx.request.body, null, 2)}`)

    // Retrieve the device model from the database.
    const device = await DevicePublicData.findById(ctx.params.id)
    if (!device) {
      ctx.throw(404, 'Could not find that device.')
    }

    // Save the uploaded data into a handy object.
    const userData = ctx.request.body

    // Get the private data model associated with this device.
    // const devicePrivateData = await DevicePrivateData.findById(device.privateData)

    // Generate a new expiration date.
    const now = new Date()
    const expiration = new Date(now.getTime() + DEFAULT_EXPIRATION)

    // Save device stats to the model.
    device.expiration = expiration.toISOString()
    device.checkinTimeStamp = now.toISOString()
    if (userData.memory) device.memory = userData.memory
    if (userData.diskSpace) device.diskSpace = userData.diskSpace
    if (userData.processor) device.processor = userData.processor
    if (userData.internetSpeed) device.internetSpeed = userData.internetSpeed
    await device.save()

    // Get device private data model
    const devicePrivateData = await DevicePrivateData.findById(device.privateData)

    // Get any previously used port assignment.
    const usedPort = devicePrivateData.serverSSHPort

    // Get Login, Password, and Port assignment.
    const loginData = await sshPort.requestPort()
    // console.log(`loginData: ${JSON.stringify(loginData, null, 2)}`)

    // TODO Move any money pending to money owed.

    // Save ssh data to the devicePrivateData model.
    devicePrivateData.serverSSHPort = loginData.port
    devicePrivateData.deviceUserName = loginData.username
    devicePrivateData.devicePassword = loginData.password
    await devicePrivateData.save()

    // If a previous port was being used, release it.
    // Dev Note: Order of operation is important here. I want to release the old port
    // *after* I request a new port. Otherwise I'll run into SSH issues.
    if (usedPort) {
      // Release the used port.
      await sshPort.releasePort(usedPort)
      console.log(`port ${usedPort} released.`)
    }

    // TODO 1/16/18 check to see if obContract model already exists for this device. If so, delete that model.

    // Create an OB store listing for this device.
    // let obContractId = await util.submitToMarket(devicePublicModel);
    const obContractId = await util.createNewMarketListing(device)
    console.log(`obContractId: ${JSON.stringify(obContractId, null, 2)}`)

    // Update the devicePublicModel with the newly created obContract model GUID.
    device.obContract = obContractId.toString()
    await device.save()

    ctx.body = {
      device
    }
  } catch (err) {
    if (err === 404 || err.name === 'CastError') {
      ctx.throw(404)
    }

    console.error(`Error in modules/client/controller.js/register(): `, err)
    ctx.throw(500)
  }

  if (next) { return next() }
}

module.exports = {
  register
}
