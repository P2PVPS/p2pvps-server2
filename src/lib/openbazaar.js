/*
  This library contains functions for interacting with a local OpenBazaar
  server via its REST API.

  This file is basically a wrapper for the openbazaar-node library. These
  functions prepare objects and data, then call the openbazaar-node library
  functions.
*/

module.exports = {
  createStoreListing,   // Create a product listing in the OB store.
  removeMarketListing,  // Remove a product listing from the OB store.
  refund             // Send a refund
}

const obLib = require(`openbazaar-node`)

// Configure for OpenBazaar
const OB_URL = `http://serverdeployment2_openbazaar_1` // Testing
// const OB_URL = `http://localhost`
const OB_PORT = 4002
const OB_USERNAME = 'yourUsername'
const OB_PASSWORD = 'yourPassword'
const obConfig = {
  clientId: OB_USERNAME,
  clientSecret: OB_PASSWORD,
  obServer: OB_URL,
  obPort: OB_PORT
}

// Get authorization to communicate with OpenBazaar (OB) API.
var apiCredentials = obLib.getOBAuth(obConfig)
obConfig.apiCredentials = apiCredentials

// Creates a listing on OpenBazaar based on an obContractModel.
// An obContractModel GUID is passed in the URI.
async function createStoreListing (obContractModel) {
  // console.log(`obContractModel: ${JSON.stringify(obContractModel)}`)

  try {
    const listingData = {
      coupons: [
        {
          discountCode: 'TESTING',
          title: 'TESTING',
          percentDiscount: 60
        }
      ],
      refundPolicy: '',
      shippingOptions: [],
      termsAndConditions: '',
      metadata: {
        contractType: 'SERVICE',
        expiry: obContractModel.experation,
        format: 'FIXED_PRICE',
        pricingCurrency: 'USD'
      },
      item: {
        categories: [],
        condition: 'NEW',
        description: obContractModel.description,
        nsfw: false,
        options: [],
        price: obContractModel.price,
        tags: [],
        title: obContractModel.title + ' (' + obContractModel.clientDevice + ')',
        images: [
          {
            filename: 'p2pvp.org.png',
            original: 'zb2rhdwvBAjky685CtiZHbA291rJGGAVpA7RhvY7vRrznX6Ne',
            large: 'zb2rhoDG3RLMkFarDGajWALbgeXgGG6xmHCZAqiTYrdrdP8ew',
            medium: 'zb2rhmdVqhZjnpw6Pwd4tCimB1L79ABcukcRnqDroP1C5B6GE',
            small: 'zb2rhiBc94WnxN3eNtbnBU2CD9sJ1X1QiaemYFpAVFwQVPDsq',
            tiny: 'zb2rhYBN6k6udcF86NWaPr1GBB8HpPYLcL1HwFtJZE7gGEpT8'
          }
        ],
        skus: [
          {
            quantity: 1,
            productID: obContractModel.clientDevice
          }
        ]
      }
    }

    // Create the listing on the OB store.
    const result = await obLib.createListing(obConfig, listingData)
    // console.log(`result: ${JSON.stringify(result, null, 2)}`)

    // Update the obContract model with information on the OB listing.
    obContractModel.listingSlug = result.slug
    obContractModel.imageHash = 'zb2rhe8p68xzhqVnVBPTELk2Sc9RuPSck3dkyJuRpM7LNfEYf'
    // await obContractModel.save()

    // Return the updated model data.
    return obContractModel
  } catch (err) {
    // debugger
    console.log('Error in src/lib/openbazaar.js/createStoreListing()')
    throw err
  }
}

// Removes a listing on OpenBazaar based on data in an obContractModel.
// An obContractModel GUID is passed in the URI.
async function removeMarketListing (slug) {
  // console.log(`openbazaar.removeMarketListing() fired. Slug: ${slug}`)

  try {
    await obLib.removeListing(obConfig, slug)
    return true
  } catch (err) {
    if (err.statusCode === 404) return true // 404 errors are OK.

    if (err.name === "RequestError'") {
      console.error(`Connection to OpenBazaar server refused. Is OpenBazaar running?`)
      throw err
    }

    console.error(`Error in src/lib/openbazaar.js removeMarketListing().`)
    throw err
  }
}

// Issues a refund to a peer definedin the refundObj.
// refundObj.addr = The BCH address to send the refund to.
// refundObj.qty = The number of Satoshis to send to the peer.
async function refund (refundObj) {
  try {
    // Validation
    if (!refundObj.addr) return
    if (!refundObj.qty) return

    const moneyObj = {
      address: refundObj.addr,
      amount: refundObj.qty,
      feeLevel: 'ECONOMIC',
      memo: 'P2P VPS Rental Refund'
    }

    console.log(`Refunding ${moneyObj.amount} satoshis to ${moneyObj.address}`)
    await obLib.sendMoney(obConfig, moneyObj)
  } catch (err) {
    console.error(`Error in openbazaar.js/refund(): `, err)
    throw err
  }
}

/** BEGIN PRIVATE FUNCTIONS ****/

/** END PRIVATE FUNCTIONS **/
