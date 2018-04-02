/*

*/

const RentedDevices = require('../../models/renteddevice')

/**
 * @api {post} /users Create a new user
 * @apiPermission
 * @apiVersion 1.0.0
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "user": { "username": "johndoe", "password": "secretpasas" } }' localhost:5000/users
 *
 * @apiParam {Object} user          User object (required)
 * @apiParam {String} user.username Username.
 * @apiParam {String} user.password Password.
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
    console.error(`Error in API sshport.requestPort: ${err}`)
    throw err
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

module.exports = {
  addDevice,
  removeDevice
}
