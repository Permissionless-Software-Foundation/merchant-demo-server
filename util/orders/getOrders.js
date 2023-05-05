import mongoose from 'mongoose'
import config from '../../config/index.js'
import User from '../../src/adapters/localdb/models/orders.js'

async function getOrders () {
  // Connect to the Mongo Database.
  mongoose.Promise = global.Promise
  mongoose.set('useCreateIndex', true) // Stop deprecation warning.
  await mongoose.connect(
    config.database,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )

  const orders = await User.find({}, '-password')
  console.log(`orders: ${JSON.stringify(orders, null, 2)}`)

  mongoose.connection.close()
}
getOrders()
