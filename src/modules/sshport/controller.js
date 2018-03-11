const SSHPort = require('../../models/sshport')

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
    //console.log(`sshPorts: ${JSON.stringify(sshPorts, null, 2)}`)

    // Handle new database by creating first entry.
    if (sshPorts.length === 0) {
      sshPorts = new SSHPort()

      newPort = 6000
    } else {
      // const sshPort = sshPorts[0]
      let lastPort = sshPorts.usedPorts[sshPorts.usedPorts.length - 1]

      // Error Handling
      if (lastPort === undefined) lastPort = 6000

      // Wrap around to 6000, once port 6200 has been reached.
      if (lastPort >= 6200) {
        console.log('Port control has reached maximum port. Resetting.')
        // portList = [];
        lastPort = 5999
      }

      newPort = lastPort + 1
    }

    try {
      sshPorts.usedPorts.push(newPort)
      await sshPorts.save()
    } catch (err) {
      ctx.throw(422, err.message)
    }

    retVal.port = newPort
    ctx.body = {
      sshPort: retVal
    }
  } catch (err) {
    console.error(`Error in API sshport.requestPort: ${err}`)
  }
}

module.exports = {
  requestPort
}

function randomString (length) {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
