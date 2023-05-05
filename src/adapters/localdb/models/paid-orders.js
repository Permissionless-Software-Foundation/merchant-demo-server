/*
  When an order has been paid, the order model is deleted and new paid-order
  model is created.
*/

// Global npm libraries
import mongoose from 'mongoose'

const PaidOrder = new mongoose.Schema({
  emailAddress: { type: String },
  shippingName: { type: String },
  shippingAddress: { type: String },
  qty: { type: String },
  txid: { type: String },
  bchPayment: { type: Number },
  bchAddr: { type: String },
  wif: { type: String },
  hdIndex: { type: String },
  timestamp: { type: Date, default: Date.now }
})

export default mongoose.model('paidOrder', PaidOrder)
