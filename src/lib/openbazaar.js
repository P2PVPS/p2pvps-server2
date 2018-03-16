/*
  This library contains functions for interacting with a local OpenBazaar
  server via its REST API.
*/

// var keystone = require('keystone')
// var request = require('request')
// var Promise = require('node-promise') // Promises to handle asynchonous callbacks.
var rp = require('request-promise')

let obLib
if (process.env.NODE_ENV === 'test') {
  obLib = require(`../../../openbazaar-node/openbazaar.js`)
} else {
  obLib = require(`openbazaar-node`)
}

const OB_URL = `http://dockerconnextcmsp2pvps_openbazaar_1`
//const OB_URL = `http://localhost`
const OB_PORT = 4002
const OB_USERNAME = 'yourUsername'
const OB_PASSWORD = 'yourPassword'
const obConfig = {
  clientId: OB_USERNAME,
  clientSecret: OB_PASSWORD,
  server: OB_URL,
  obPort: OB_PORT
}

// var DevicePublicModel = keystone.list('DevicePublicModel')
// var DevicePrivateModel = keystone.list('DevicePrivateModel')
// var obContractModel = keystone.list('obContractModel')

// Creates a listing on OpenBazaar based on an obContractModel.
// An obContractModel GUID is passed in the URI.
async function createStoreListing (obContractModel) {
  console.log(`obContractModel: ${JSON.stringify(obContractModel)}`)

  try {
    const listingData = {
      coupons: [
        {
          discountCode: 'TESTING',
          title: 'TESTING',
          priceDiscount: 29
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
        images: [{
          filename: 'p2pvp.org.png',
          original: 'zb2rhdwvBAjky685CtiZHbA291rJGGAVpA7RhvY7vRrznX6Ne',
          large: 'zb2rhoDG3RLMkFarDGajWALbgeXgGG6xmHCZAqiTYrdrdP8ew',
          medium: 'zb2rhmdVqhZjnpw6Pwd4tCimB1L79ABcukcRnqDroP1C5B6GE',
          small: 'zb2rhiBc94WnxN3eNtbnBU2CD9sJ1X1QiaemYFpAVFwQVPDsq',
          tiny: 'zb2rhYBN6k6udcF86NWaPr1GBB8HpPYLcL1HwFtJZE7gGEpT8'
        }],
        skus: [{
          quantity: 1,
          productID: obContractModel.clientDevice
        }]
      }
    }

    var apiCredentials = obLib.getOBAuth(obConfig)
    obConfig.apiCredentials = apiCredentials
/*
    var options = {
      method: 'POST',
      uri: OB_URL,
      body: listingData,
      json: true, // Automatically stringifies the body to JSON
      headers: {
        'Authorization': apiCredentials
      }
        // resolveWithFullResponse: true
    }

    const result = await rp(options)
*/
    // const result = await obLib.getNotifications(obConfig)
    const result = await obLib.createListing(obConfig, listingData)
    console.log(`result: ${JSON.stringify(result, null, 2)}`)

/*
    rp(options)
      .then(function (data) {
        // debugger

        item.set('listingSlug', data.slug)
        item.set('imageHash', 'zb2rhe8p68xzhqVnVBPTELk2Sc9RuPSck3dkyJuRpM7LNfEYf')
        item.save()

        return res.apiResponse({success: true})
      })
      .catch(function (err) {
        debugger
        if (err.error) {
          if (err.error.code === 'ECONNREFUSED') {
            return res.apiError('Could not create marketlisting. Error communicating with local OpenBazaar Server!')
          } else {
            console.error('Could not create marketlisting. Error in openbazaar.js/createMarketListing().')
            console.error('Error stringified: ' + JSON.stringify(err, null, 2))
            return res.apiError('Could not create marketlisting. Error communicating with local OpenBazaar Server!')
          }
        } else {
          console.error('Could not create marketlisting. Error in openbazaar.js/createMarketListing().')
          console.error('Error stringified: ' + JSON.stringify(err, null, 2))
          return res.apiError('Could not create marketlisting. Error communicating with local OpenBazaar Server!')
        }
      })
    */
  } catch (err) {
    // debugger
    console.log('Error in src/lib/openbazaar.js/createStoreListing()')
    throw err
  }
}

/*
// Updates a listing on OpenBazaar based on data in an obContractModel.
// An obContractModel GUID is passed in the URI.
exports.updateListing = function (req, res) {
  obContractModel.model.findById(req.params.id).exec(function (err, item) {
    if (err) return res.apiError('database error', err)
    if (!item) return res.apiError('not found')

    debugger

    try {
      var listingData = {
        slug: item.get('listingSlug'),
        coupons: [],
        refundPolicy: '',
        shippingOptions: [],
        termsAndConditions: '',
        metadata: {
          contractType: 'SERVICE',
          expiry: item.get('experation'),
          format: 'FIXED_PRICE',
          pricingCurrency: 'USD'
        },
        item: {
          categories: [],
          condition: 'NEW',
          description: item.get('description'),
          nsfw: false,
          options: [],
          price: item.get('price'),
          tags: [],
          title: item.get('title') + ' (' + item.get('clientDevice') + ')',
          images: [{
            filename: 'pirate-skeleton.jpg',
            large: 'zb2rhkefdSxmv76UAeqscBV4WbDvvzDbHkEfHkqXQJUWLNt4T',
            medium: 'zb2rhYk7MzEQ287fCx62cpcEd1KnS9S3YehzmpwLwv55jLMW7',
            original: 'zb2rhe8p68xzhqVnVBPTELk2Sc9RuPSck3dkyJuRpM7LNfEYf',
            small: 'zb2rhWgwTTAawnnpAvCjfpvmuXsQSPDwf8miZi9E7PxkPvXtz',
            tiny: 'zb2rhbUYPQtLCoqyqiKK1YRdSBHf1w3Gh88tyVdQWvGGQ93vX'
          }],
          skus: [{
            quantity: -1
          }]
        }
      }

      var apiCredentials = _getOBAuth()

      var options = {
        method: 'PUT',
        uri: 'http://dockerconnextcmsp2pvps_openbazaar_1:4002/ob/listing/' + item.get('listingSlug'),
        body: listingData,
        json: true, // Automatically stringifies the body to JSON
        headers: {
          'Authorization': apiCredentials
        }
        // resolveWithFullResponse: true
      }

      rp(options)
      .then(function (data) {
        debugger

        return res.apiResponse({success: true})
      })
      .catch(function (err) {
        debugger
        return res.apiError('Could not update listing. Error communicating with local OpenBazaar Server!', err)
      })
    } catch (err) {
      debugger
      return res.apiError('API error: ', err)
    }
  })
}

// Removes a listing on OpenBazaar based on data in an obContractModel.
// An obContractModel GUID is passed in the URI.
exports.removeMarketListing = function (req, res) {
  obContractModel.model.findById(req.params.id).exec(function (err, item) {
    if (err) return res.apiError('database error', err)
    if (!item) return res.apiError('not found')

    debugger

    try {
      var apiCredentials = _getOBAuth()

      var listingData = {
        slug: item.get('listingSlug')
      }

      var options = {
        method: 'DELETE',
        uri: 'http://dockerconnextcmsp2pvps_openbazaar_1:4002/ob/listing/' + item.get('listingSlug'),
        body: listingData,
        json: true, // Automatically stringifies the body to JSON
        headers: {
          'Authorization': apiCredentials
        }
        // resolveWithFullResponse: true
      }

      rp(options)
      .then(function (data) {
        debugger

        // return res.apiResponse({success: true})

        // Also delete the obContract model
        item.remove(function (err) {
          if (err) return res.apiError('database error', err)

          return res.apiResponse({
            success: true
          })
        })
      })
      .catch(function (err) {
        debugger
        return res.apiError('Could not remove market listing. Error communicating with local OpenBazaar Server!', err)
      })
    } catch (err) {
      debugger
      return res.apiError('API error: ', err)
    }
  })
}
*/

/** BEGIN PRIVATE FUNCTIONS ****/

function _getOBAuth () {
  // debugger

  var clientID = 'yourUsername'
  var clientSecret = 'yourPassword'

  // Encoding as per Centro API Specification.
  var combinedCredential = clientID + ':' + clientSecret
  // var base64Credential = window.btoa(combinedCredential);
  var base64Credential = Buffer.from(combinedCredential).toString('base64')
  var readyCredential = 'Basic ' + base64Credential

  return readyCredential
}

/** END PRIVATE FUNCTIONS **/

module.exports = {
  createStoreListing
}
