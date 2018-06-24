/*
  This API handles maintenance calls for rented devices.
*/

const RentedDevices = require('../../models/renteddevice')
const util = require('../../lib/util')

const DevicePublicData = require('../../models/devicepublicdata')

/**
 * @api {post} /api/renteddevices Add to the Rented Devices list
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName AddDevice
 * @apiGroup Rented-Devices
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "deviceId": "<device ID>" }' localhost:5000/api/renteddevices
 *
 * @apiParam {ObjectId} deviceId  Public Device ID (required)
 *
 * @apiSuccess {StatusCode} 200
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true
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
// Unit Test: Ensure that multiple calls persist data in the array.
async function addDevice (ctx) {
  // console.log(`POST /sshport/requestPort called`)

  try {
    // deviceId should be passed in Post.
    const deviceId = ctx.request.body.deviceId

    const isKnownDevice = await verifyDeviceExists(deviceId)
    if (!isKnownDevice) {
      ctx.throw(404, 'Device not found')
    }

    // Retrieve the Rented Devices array.
    let rentedDevices = await RentedDevices.find({})

    // Handle new database by creating first entry.
    if (rentedDevices.length === 0) {
      rentedDevices = new RentedDevices()

      try {
        rentedDevices.deviceList.push(deviceId)
        await rentedDevices.save()
      } catch (err) {
        ctx.throw(422, err.message)
      }
    } else {
      const deviceList = rentedDevices[0].deviceList

      // Ensure the device is not already on the list.
      for (let i = 0; i < deviceList.length; i++) {
        const thisDevice = deviceList[i]
        if (thisDevice === deviceId) {
          ctx.throw(422, 'Device already in list')
        }
      }

      // Add the device to the list.
      deviceList.push(deviceId)

      try {
        rentedDevices[0].deviceList = deviceList
        await rentedDevices[0].save()
      } catch (err) {
        ctx.throw(422, err.message)
      }
    }

    ctx.body = {
      success: true
    }
  } catch (err) {
    // console.error(`Error in API renteddevics.addDevice: ${err}`)
    ctx.throw(err)
  }
}

/**
 * @api {get} /api/renteddevices Get list of rented devices
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName GetDevices
 * @apiGroup Rented-Devices
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/api/renteddevices
 *
 * @apiSuccess {Object[]} devices   Array of device IDs
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "devices": [
 *          "56bd1da600a526986cf65c80",
 *          "56bd1da600a526986cf65c81"
 *       ]
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
// Get a list of all the devices currently rented.
async function getDevices (ctx) {
  try {
    // Get the rentedDevices model from the DB.
    const rentedDevices = await RentedDevices.find({})

    // Empty DB.
    if (!rentedDevices || rentedDevices.length === 0) {
      ctx.body = {
        devices: []
      }

    // All other cases.
    } else {
      ctx.body = {
        devices: rentedDevices[0].deviceList
      }
    }
  } catch (err) {
    console.error(`Error in /api/renteddevices/getDevices(): `, err)
    ctx.throw(503, err.message)
  }
}

/**
 * @api {get} /api/renteddevices/renew/:id Renew a device in the rented devices list
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName RenewDevice
 * @apiGroup Rented-Devices
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/api/renteddevice/renew/<id>
 *
 * @apiSuccess {StatusCode} 200
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "obContract": <GUID>
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
// Renew a device from the renteddevices list
async function renewDevice (ctx, next) {
  try {
    // Get the rentedDevices model from the DB.
    const rentedDevices = await RentedDevices.find({})

    // Handle Empty DB.
    if (!rentedDevices || rentedDevices.length === 0) {
      ctx.throw(422, 'Rented device list is empty')
      // ctx.throw(422)
    }

    // Ensure the device is in the rentedDevices list.
    const devices = rentedDevices[0].deviceList
    const deviceId = ctx.params.id
    const isInList = devices.find(thisId => thisId === deviceId)
    if (!isInList) {
      ctx.throw(422, `Device is not in rented device list.`)
    }

    // Access the public device models.
    const DevicePublicData = require('../../models/devicepublicdata')

    // Retrieve the device model from the database.
    const device = await DevicePublicData.findById(deviceId)
    if (!device) {
      ctx.throw(404, 'Could not find that device.')
    }

    // Create an OB store listing for this device.
    // Note: the utility function will automaticaly remove old listings if they exist.
    const obContractId = await util.createNewMarketListing(device)
    console.log(`renewal generated, obContractId: ${JSON.stringify(obContractId, null, 2)}`)

    // Update the device with the newly created obContract model GUID.
    device.obContract = obContractId.toString()
    await device.save()

    ctx.status = 200
    ctx.body = {
      success: true,
      obContract: obContractId
    }

    if (next) { return next() }
  } catch (err) {
    ctx.throw(422, err.message)
  }
}

/**
 * @api {delete} /api/renteddevices/:id Delete devices from list
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName DeleteDevice
 * @apiGroup Rented-Devices
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X DELETE localhost:5000/api/renteddevices/:id
 *
 * @apiSuccess {StatusCode} 200
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true
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
async function removeDevice (ctx) {
  try {
    // Retrieve the Rented Devices array.
    let rentedDevices = await RentedDevices.find({})

    // Error handling
    if (rentedDevices.length === 0) ctx.throw(404, 'not found')

    // Get an array of ports in use.
    const deviceList = rentedDevices[0].deviceList

    // Device to be removed.
    const deviceId = ctx.params.id

    // Remove the port from the array.
    let newArray = deviceList.filter(e => e !== deviceId)

    // If the port was not found, return 404.
    if (newArray.length === deviceList.length) ctx.throw(404)

    // Save the new array.
    try {
      rentedDevices[0].deviceList = newArray
      await rentedDevices[0].save()
    } catch (err) {
      ctx.throw(422, err.message)
    }

    ctx.status = 200
    ctx.body = {
      success: true
    }
  } catch (err) {
    if (err.message === 'Not Found') {
      ctx.throw(404)
    } else {
      console.error(`Error in API sshport.releasePort: ${err}`)
      // console.error(`err stringified: ${JSON.stringify(err, null, 2)}`)
      throw err
    }
  }
}

async function verifyDeviceExists (deviceId) {
  try {
    const devices = await DevicePublicData.find({})

    const foundDevice = devices.find(thisDevice => thisDevice._id.toString() === deviceId)

    if (!foundDevice) { return false }

    return true
  } catch (err) {
    throw err
  }
}

module.exports = {
  addDevice,
  getDevices,
  renewDevice,
  removeDevice
}
