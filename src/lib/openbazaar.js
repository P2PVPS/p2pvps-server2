/*
  This library contains functions for interacting with a local OpenBazaar
  server via its REST API.
*/

const obLib = require(`openbazaar-node`)

// Configure for OpenBazaar
const OB_URL = `http://dockerconnextcmsp2pvps_openbazaar_1`
// const OB_URL = `http://localhost`
const OB_PORT = 4002
const OB_USERNAME = 'yourUsername'
const OB_PASSWORD = 'yourPassword'
const obConfig = {
  clientId: OB_USERNAME,
  clientSecret: OB_PASSWORD,
  server: OB_URL,
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
*/

// Removes a listing on OpenBazaar based on data in an obContractModel.
// An obContractModel GUID is passed in the URI.
async function removeMarketListing (slug) {
  console.log(`openbazaar.removeMarketListing() fired. Slug: ${slug}`)

  try {
    await obLib.removeListing(obConfig, slug)
    return true
  } catch (err) {
    console.error(`Error in src/lib/openbazaar.js removeMarketListing().`)
    throw err
  }
}

/** BEGIN PRIVATE FUNCTIONS ****/

/** END PRIVATE FUNCTIONS **/

module.exports = {
  createStoreListing,
  removeMarketListing
}
