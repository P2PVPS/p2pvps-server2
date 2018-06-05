/*
  Dev Note: CT 3/11/18
  This controller for the port control may be better as a module library instead
  of an API. Right now, only the client API uses it. If no other areas of the system
  use this API, then it would be better/more secure as a module library.
*/

const SSHPort = require('../../models/sshport')

/**
 * @api {post} /api/sshport Request SSH Port
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName RequestPort
 * @apiGroup SSH-Port
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST localhost:5000/api/sshport
 *
 *
 * @apiSuccess {Object}   sshPort           sshPort object
 * @apiSuccess {String}   sshPort.username  SSH Username
 * @apiSuccess {String}   sshPort.password  SSH Password
 * @apiSuccess {String}   sshPort.port      SSH Port
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "sshPort": {
 *          "username": "IVyJMFcIUA"
 *          "password": "UyrpfQyrPx"
 *          "port": 6001
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
async function requestPort (ctx) {
  // console.log(`POST /sshport/requestPort called`)

  try {
    // Randomly generate username
    const username = randomString(10)

    // Randomly generate password
    const password = randomString(10)

    const retVal = {
      username: username,
      password: password
    }

    // The new port that will be opened.
    let newPort

    // Retrieve the SSH Ports array.
    let sshPorts = await SSHPort.find({})

    // Handle new database by creating first entry.
    if (sshPorts.length === 0) {
      sshPorts = new SSHPort()

      newPort = 6000

      try {
        sshPorts.usedPorts.push(newPort)
        await sshPorts.save()
      } catch (err) {
        ctx.throw(422, err.message)
      }
    } else {
      const usedPorts = sshPorts[0].usedPorts
      let lastPort = usedPorts[usedPorts.length - 1]

      // Error Handling
      if (lastPort === undefined) lastPort = 6000

      // Wrap around to 6000, once port 6200 has been reached.
      if (lastPort >= 6200) {
        lastPort = 5999
      }

      newPort = lastPort + 1

      try {
        sshPorts[0].usedPorts.push(newPort)
        await sshPorts[0].save()
      } catch (err) {
        ctx.throw(422, err.message)
      }
    }

    retVal.port = newPort
    ctx.body = {
      sshPort: retVal
    }
  } catch (err) {
    console.error(`Error in API sshport.requestPort: ${err}`)
    throw err
  }
}

/**
 * @api {delete} /api/sshport/:port Release SSH Port
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName ReleasePort
 * @apiGroup SSH-Port
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X DELETE localhost:5000/api/sshport/:port
 *
 * @apiSuccess {StatusCode} 200
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true
 *     }
 *
 */
async function releasePort (ctx) {
  try {
    // Retrieve the SSH Ports array.
    const sshPorts = await SSHPort.find({})

    // Error handling
    if (sshPorts.length === 0) ctx.throw(404, 'not found')

    // Get an array of ports in use.
    const usedPorts = sshPorts[0].usedPorts

    // Port to be removed.
    const port = Number(ctx.params.id)

    // Remove the port from the array.
    let newArray = usedPorts.filter(e => e !== port)

    // If the port was not found, return 404.
    if (newArray.length === usedPorts.length) ctx.throw(404)

    // Save the new array.
    try {
      sshPorts[0].usedPorts = newArray
      await sshPorts[0].save()
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
  requestPort,
  releasePort
}

function randomString (length) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
