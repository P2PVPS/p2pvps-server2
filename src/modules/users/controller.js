const User = require('../../models/users')

/**
 * @api {post} /api/users Create a new user
 * @apiPermission none
 * @apiVersion 1.0.1
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X POST -d '{ "user": { "username": "testuser", "password": "testpass" } }' localhost:5000/api/users
 *
 * @apiParam {Object} user          User object (required)
 * @apiParam {String} user.username Username.
 * @apiParam {String} user.password Password.
 *
 * @apiSuccess {Object}   user           User object
 * @apiSuccess {ObjectId} user._id       User id
 * @apiSuccess {String}   user.type      User type (admin or user)
 * @apiSuccess {String}   user.name      User name
 * @apiSuccess {String}   user.username  User name
 * @apiSuccess {Object}   token          Auth token
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "type": "user"
 *          "name": "John Doe"
 *          "username": "johndoe"
 *       },
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjViMDE5ZjgwMjUzZWIxMGM3YzQ5ZDE1NiIsImlhdCI6MTUyNjgzMzAyNH0.ce39pJwFXSTsFv1KLQ5_oB0NGmxutsb3HrAd2rxgpl0"
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

async function createUser (ctx) {
  const user = new User(ctx.request.body.user)

  // Enforce default value of 'user'
  user.type = 'user'

  try {
    await user.save()
  } catch (err) {
    ctx.throw(422, err.message)
  }

  // console.log(`new user: ${JSON.stringify(user, null, 2)}`)

  const token = user.generateToken()
  const response = user.toJSON()

  // console.log(`response: ${JSON.stringify(response, null, 2)}`)

  delete response.password

  ctx.body = {
    user: response,
    token
  }
}

/**
 * @api {get} /api/users Get all users
 * @apiPermission user
 * @apiVersion 1.0.1
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X GET localhost:5000/api/users
 *
 * @apiSuccess {Object[]} users           Array of user objects
 * @apiSuccess {ObjectId} users._id       User id
 * @apiSuccess {String}   users.type      User type (admin or user)
 * @apiSuccess {String}   users.name      User name
 * @apiSuccess {String}   users.username  User username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "users": [{
 *          "_id": "56bd1da600a526986cf65c80"
 *          "type": "user"
 *          "name": "John Doe"
 *          "username": "johndoe"
 *       }]
 *     }
 *
 * @apiUse TokenError
 */

async function getUsers (ctx) {
  const users = await User.find({}, '-password -dashIds')
  ctx.body = { users }
}

/**
 * @api {get} /api/users/:id Get user by id
 * @apiPermission user
 * @apiVersion 1.0.1
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X GET localhost:5000/api/users/56bd1da600a526986cf65c80
 *
 * @apiSuccess {Object}   user           User object
 * @apiSuccess {ObjectId} user._id       User id
 * @apiSuccess {String}   user.type      User type (admin or user)
 * @apiSuccess {String}   user.name      User name
 * @apiSuccess {String}   user.username  User username
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
 * @apiDescription Return data on a specific user. If a user calls this API on
 * themselves, then a dashIds array will be returned. If not, the dashIds propery
 * will not be returned.
 */
async function getUser (ctx, next) {
  try {
    // Remove the dashIds array if the caller is not the current user being queried.
    const thisUser = ctx.state.user
    let user
    if (thisUser._id.toString() !== ctx.params.id) {
      user = await User.findById(ctx.params.id, '-password -dashIds')
    } else {
      user = await User.findById(ctx.params.id, '-password')
    }

    // Throw an error if the user could not be found.
    if (!user) {
      ctx.throw(404)
    }

    ctx.body = {
      user
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
 * @api {put} /api/users/:id Update a user
 * @apiPermission user
 * @apiVersion 1.0.1
 * @apiName UpdateUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X PUT -d '{ "user": { "name": "Cool new Name" } }' localhost:5000/api/users/56bd1da600a526986cf65c80
 *
 * @apiParam {Object} user          User object (required)
 * @apiParam {String} user.name     Name.
 * @apiParam {String} user.username Username.
 *
 * @apiSuccess {Object}   user           User object
 * @apiSuccess {ObjectId} user._id       User id
 * @apiSuccess {String}   user.name      Updated name
 * @apiSuccess {String}   user.type      User type (admin or user)
 * @apiSuccess {String}   user.username  Updated username
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "user": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "type": "user"
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
async function updateUser (ctx) {
  const user = ctx.body.user

  // Save a copy of the original user type.
  const userType = user.type

  Object.assign(user, ctx.request.body.user)

  // Unless the calling user is an admin, they can not change the user type.
  if (userType !== 'admin') {
    user.type = userType
  }

  await user.save()

  ctx.body = {
    user
  }
}

/**
 * @api {delete} /api/users/:id Delete a user
 * @apiPermission user
 * @apiVersion 1.0.1
 * @apiName DeleteUser
 * @apiGroup Users
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X DELETE localhost:5000/api/users/5b019f80253eb10c7c49d156
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
async function deleteUser (ctx) {
  const user = ctx.body.user

  await user.remove()

  ctx.status = 200
  ctx.body = {
    success: true
  }
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
}
