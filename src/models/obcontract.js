const mongoose = require('mongoose')

const OBContract = new mongoose.Schema({
  ownerUser: { type: String, required: true },
  clientDevice: { type: String, required: true },
  renterUser: { type: String },
  price: { type: Number },
  experation: { type: String }, // Experation of the listing, not the rental contract.
  title: { type: String },
  description: { type: String },
  listingUri: { type: String }, // OB URI
  imageHash: { type: String }, // OB Image URI
  listingSlug: { type: String }, // OB listing slug
  listingState: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String }
})

module.exports = mongoose.model('obContract', OBContract)
