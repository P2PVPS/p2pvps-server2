const OBContract = require('../../models/obcontract')

/**
 * @api {post} /api/obcontract Create an OB Contract
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName CreateContract
 * @apiGroup OB-Contract
 *
 * @apiDescription This creates an obContract model in the database as well as
 * a new listing in the OpenBazaar store. The database model is used to generate
 * and regenerate the store listing.
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X POST -d '{ "obContract": { "clientDevice": "<GUID>", "ownerUser": "<GUID>" } }' localhost:5000/api/obcontract
 *
 * @apiParam {Object} obContract                OB Contract object (required)
 * @apiParam {ObjectId} obContract.clientDevice Device Public ID (required)
 * @apiParam {ObjectId} obContract.ownerUser    Device Owner ID (required)
 * @apiParam {ObjectId} obContract.renterUser   Renter ID
 * @apiParam {String} obContract.price          Price per hour
 * @apiParam {String} obContract.experation     Experation of the listing
 * @apiParam {String} obContract.title          Listing title
 * @apiParam {String} obContract.description    Listing description
 * @apiParam {String} obContract.listingUri     OB URL
 * @apiParam {String} obContract.imageHash      OB/IPFS image hash
 * @apiParam {String} obContract.listingSlug    OB listing slug
 * @apiParam {String} obContract.listingState   State of listing
 * @apiParam {String} obContract.createdAt      ISO Date contract was created
 * @apiParam {String} obContract.updatedAt      ISO Date contract was updated
 *
 * @apiSuccess {Object}   obContract              User object
 * @apiSuccess {ObjectId} obContract._id          User id
 * @apiSuccess {ObjectId} obContract.clientDevice Device Public ID
 * @apiSuccess {ObjectId} obContract.ownerUser    Device Owner ID
 * @apiSuccess {ObjectId} obContract.renterUser   Renter ID
 * @apiSuccess {String} obContract.price          Price per hour
 * @apiSuccess {String} obContract.experation     Experation of the listing
 * @apiSuccess {String} obContract.title          Listing title
 * @apiSuccess {String} obContract.description    Listing description
 * @apiSuccess {String} obContract.listingUri     OB URL
 * @apiSuccess {String} obContract.imageHash      OB/IPFS image hash
 * @apiSuccess {String} obContract.listingSlug    OB listing slug
 * @apiSuccess {String} obContract.listingState   State of listing
 * @apiSuccess {String} obContract.createdAt      ISO Date contract was created
 * @apiSuccess {String} obContract.updatedAt      ISO Date contract was updated
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "obContract": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "clientDevice": "5b038287eb56080a3d1b31b6"
 *          "ownerUser": "5b038000eb56080a3d1b31b4"
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
async function createContract (ctx) {
  // console.log(`createContract(obContract): ${JSON.stringify(ctx.request.body.obContract, null, 2)}`)
  const obContract = new OBContract(ctx.request.body.obContract)
  try {
    await obContract.save()
  } catch (err) {
    ctx.throw(422, err.message)
  }

  ctx.body = {
    obContract: obContract
  }
}

/**
 * @api {get} /api/obcontract Get all OB Contracts
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName GetContracts
 * @apiGroup OB-Contract
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/api/obcontract
 *
 * @apiSuccess {Object[]} obContracts             Array of obContract objects
 * @apiSuccess {ObjectId} obContracts._id          User id
 * @apiSuccess {ObjectId} obContracts.clientDevice Device Public ID
 * @apiSuccess {ObjectId} obContracts.ownerUser    Device Owner ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "obContracts": [{
 *          "_id": "56bd1da600a526986cf65c80"
 *          "clientDevice": "56bd1da600a526986cf65c81"
 *          "ownerUser": "56bd1da600a526986cf65c82"
 *       }]
 *     }
 *
 * @apiUse TokenError
 */
async function getContracts (ctx) {
  const obContracts = await OBContract.find({})
  ctx.body = { obContracts }
}

/**
 * @api {get} /api/obcontract/:id Get contract by id
 * @apiPermission none
 * @apiVersion 1.0.0
 * @apiName GetContract
 * @apiGroup OB-Contract
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -X GET localhost:5000/api/obcontract/5b04db9efdcdc90aba9228ad
 *
 * @apiSuccess {Object}   obContract              obContract object
 * @apiSuccess {ObjectId} obContract._id          obContract id
 * @apiSuccess {ObjectId} obContract.clientDevice Device Public ID
 * @apiSuccess {ObjectId} obContract.ownerUser    Device Owner ID
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "obContract": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "clientDevice": "56bd1da600a526986cf65c81"
 *          "ownerUser": "56bd1da600a526986cf65c82"
 *       }
 *     }
 *
 * @apiUse TokenError
 */
async function getContract (ctx, next) {
  try {
    // Validate the input ID.
    const deviceId = ctx.params.id
    if (!deviceId.match(/^[0-9a-fA-F]{24}$/)) {
      ctx.throw(422, 'Invalid GUID')
    }

    const obContract = await OBContract.findById(deviceId)
    if (!obContract) {
      ctx.throw(404)
    }

    ctx.body = {
      obContract
    }
  } catch (err) {
    if (err === 500) {
      console.error(`Error in modules/client/controller.js/checkIn()`)
    }

    ctx.throw(err)
  }

  if (next) { return next() }
}

/**
 * @api {put} /api/obcontract/:id Update contract by id
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName UpdateContract
 * @apiGroup OB-Contract
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X PUT -d '{ "obContract": { "price": "10" } }' localhost:5000/api/obcontract/56bd1da600a526986cf65c80
 *
 * @apiParam {Object} obContract        obContract object (required)
 * @apiParam {Number} obContract.price  Price property, for example
 *
 * @apiSuccess {Object}   obContract              obContract object
 * @apiSuccess {ObjectId} obContract._id          obContract id
 * @apiSuccess {ObjectId} obContract.clientDevice Device Public ID
 * @apiSuccess {ObjectId} obContract.ownerUser    Device Owner ID
 * @apiSuccess {Number}   obContract.price        Price is cents (USD)
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "obContract": {
 *          "_id": "56bd1da600a526986cf65c80"
 *          "clientDevice": "56bd1da600a526986cf65c81"
 *          "ownerUser": "56bd1da600a526986cf65c82"
 *          "price": 10
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
async function updateContract (ctx) {
  const obContract = ctx.body.obContract

  Object.assign(obContract, ctx.request.body.obContract)

  await obContract.save()

  ctx.body = {
    obContract
  }
}

/**
 * @api {delete} /api/obcontract/:id Delete contract by id
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiName DeleteContract
 * @apiGroup OB-Contract
 *
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "Authorization: Bearer <token>" -X DELETE localhost:5000/api/obcontract/56bd1da600a526986cf65c80
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

async function deleteContract (ctx) {
  const obContract = ctx.body.obContract

  const isNotOwner = obContract.ownerUser.toString() !== ctx.state.user._id.toString()
  const isNotAdmin = ctx.state.user.type !== 'admin'

  // Reject update if the user is not the device owner.
  if (isNotOwner && isNotAdmin) {
    console.log('Non-Device User trying to change Device model!')
    console.log(`Current device owner: ${obContract.ownerUser}`)
    console.log(`Current user: ${ctx.state.user._id}`)
    ctx.throw(401, 'Only device owners can edit device details.')
  }

  await obContract.remove()

  ctx.status = 200
  ctx.body = {
    success: true
  }
}

module.exports = {
  createContract,
  getContracts,
  getContract,
  updateContract,
  deleteContract
}
