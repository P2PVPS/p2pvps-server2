const DevicePrivateData = require('../../models/deviceprivatedata')

/**
 * @api {get} /api/deviceprivatedata/:id Get device by id
 * @apiPermission admin
 * @apiVersion 1.0.0
 * @apiName GetDevice
 * @apiGroup Device-Private
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X GET localhost:5000/api/deviceprivatedata/56bd1da600a526986cf65c80
 *
 * @apiSuccess {Object}   devicePrivateData               Device Private Data object
 * @apiSuccess {ObjectId} devicePrivateData._id           Device Private Data id
 * @apiSuccess {ObjectId} devicePrivateData.ownerUser     Owner id
 * @apiSuccess {ObjectId} devicePrivateData.publicData    Device Public Data id
 * @apiSuccess {String} devicePrivateData.deviceUserName  SSH Login
 * @apiSuccess {String} devicePrivateData.devicePassword  SSH Password
 * @apiSuccess {String} devicePrivateData.serverSSHPort   SSH Port
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *    {
 *      "devicePrivateData":{
 *        "_id":"5b038287eb56080a3d1b31b6",
 *        "ownerUser":"5b038000eb56080a3d1b31b4",
 *        "publicData":"5b038287eb56080a3d1b31b5",
 *        "devicePassword":"IQGG79CTOH",
 *        "deviceUserName":"CGG4fTAD30",
 *        "serverSSHPort":"6000"
 *      }
 *    }
 *
 * @apiUse TokenError
 */
async function getModel (ctx, next) {
  try {
    // Validate the input ID.
    const deviceId = ctx.params.id
    if (!deviceId.match(/^[0-9a-fA-F]{24}$/)) {
      ctx.throw(422, 'Invalid GUID')
    }

    const devicePrivateData = await DevicePrivateData.findById(deviceId)
    if (!devicePrivateData) {
      ctx.throw(404)
    }

    // console.log(`devicePrivateData: ${JSON.stringify(devicePrivateData, null, 2)}`)

    ctx.body = {
      devicePrivateData
    }
  } catch (err) {
    if (err === 500) {
      console.error(`Error in devicePricateData.getModel()`)
    }

    ctx.throw(err)
  }

  if (next) { return next() }
}

/**
 * @api {put} /api/deviceprivatedata/:id Update a device
 * @apiPermission admin
 * @apiVersion 1.0.0
 * @apiName UpdateDevice
 * @apiGroup Device-Private
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X PUT -d '{ "devicePrivateData": { "deviceUserName": "ABCD1234" } }' localhost:5000/api/deviceprivatedata/56bd1da600a526986cf65c80
 *
 * @apiParam {Object}   devicePrivateData               Device Private Data object
 * @apiParam {ObjectId} devicePrivateData.ownerUser     Owner id
 * @apiParam {ObjectId} devicePrivateData.publicData    Device Public Data id
 * @apiParam {String} devicePrivateData.deviceUserName  SSH Login
 * @apiParam {String} devicePrivateData.devicePassword  SSH Password
 * @apiParam {String} devicePrivateData.serverSSHPort   SSH Port
 *
 * @apiSuccess {Object}   devicePrivateData               Device Private Data object
 * @apiSuccess {ObjectId} devicePrivateData._id           Device Private Data id
 * @apiSuccess {ObjectId} devicePrivateData.ownerUser     Owner id
 * @apiSuccess {ObjectId} devicePrivateData.publicData    Device Public Data id
 * @apiSuccess {String} devicePrivateData.deviceUserName  SSH Login
 * @apiSuccess {String} devicePrivateData.devicePassword  SSH Password
 * @apiSuccess {String} devicePrivateData.serverSSHPort   SSH Port
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "devicePrivateData":{
 *        "_id":"5b038287eb56080a3d1b31b6",
 *        "ownerUser":"5b038000eb56080a3d1b31b4",
 *        "publicData":"5b038287eb56080a3d1b31b5",
 *        "devicePassword":"IQGG79CTOH",
 *        "deviceUserName":"CGG4fTAD30",
 *        "serverSSHPort":"6000"
 *      }
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
async function updateModel (ctx) {
  const devicePrivateData = ctx.body.devicePrivateData

  Object.assign(devicePrivateData, ctx.request.body.devicePrivateData)

  await devicePrivateData.save()

  ctx.body = {
    devicePrivateData
  }
}

module.exports = {
  getModel,
  updateModel
}
