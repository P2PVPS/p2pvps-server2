const DevicePublicData = require('../../models/devicepublicdata')
// const DevicePrivateData = require('../../models/deviceprivatedata')

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
    console.log(`body data: ${JSON.stringify(ctx.request.body.device, null, 2)}`)

    // Retrieve the device model from the database.
    const device = await DevicePublicData.findById(ctx.params.id)
    if (!device) {
      ctx.throw(404, 'Could not find that device.')
    }

    // Get the private data model associated with this device.
    // const devicePrivateData = await DevicePrivateData.findById(device.privateData)

    // Generate a new expiration date.
    const now = new Date()
    const expiration = new Date(now.getTime() + DEFAULT_EXPIRATION)

    // Save device stats to the model.
    device.expiration = expiration.toISOString()
    device.save()

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

module.exports = {
  register
}
