/*
  Database model for storing new orders.
*/

// Global npm libraries
import mongoose from 'mongoose'

const Order = new mongoose.Schema({
  emailAddress: { type: String },
  shippingName: { type: String },
  shippingAddress: { type: String },
  qty: { type: String },
  txid: { type: String },
  bchAddr: { type: String },
  wif: { type: String },
  hdIndex: { type: String },
  timestamp: { type: Date, default: Date.now }
})

// export default mongoose.model('user', User)
export default mongoose.model('order', Order)
