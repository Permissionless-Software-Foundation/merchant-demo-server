import mongoose from 'mongoose'
import config from '../../config/index.js'
import PaidOrders from '../../src/adapters/localdb/models/paid-orders.js'

async function getPaidOrders () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(
    config.database,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )

  const paidOrders = await PaidOrders.find({})
  console.log(`orders: ${JSON.stringify(paidOrders, null, 2)}`)

  mongoose.connection.close()
}
getPaidOrders()
