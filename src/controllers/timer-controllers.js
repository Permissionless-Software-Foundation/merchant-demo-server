/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially.
*/

import config from '../../config/index.js'

class TimerControllers {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Timer Controller libraries.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Timer Controller libraries.'
      )
    }

    this.debugLevel = localConfig.debugLevel

    // Encapsulate dependencies
    this.config = config

    // Bind 'this' object to all subfunctions.
    this.checkOrders = this.checkOrders.bind(this)

    // this.startTimers()
  }

  // Start all the time-based controllers.
  startTimers () {

    this.checkOrdersHandle = setInterval(this.checkOrders, 600 * 10)

    return true
  }

  stopTimers () {
    clearInterval(this.checkOrdersHandle)
  }

  // Check on any outstanding orders.
  checkOrders () {
    try {
      console.log('checkOrders() executed.')

      // Get all orders from the database.

      // Check the balance of each order.

      // If the balance is sufficient, then send a message to the merchant, and delete the order from the database.

      // If the order is older than 24 hours, then delete the order from the database.

      return true
    } catch (err) {
      console.error('Error in checkOrders(): ', err)

      // Note: Do not throw an error. This is a top-level function.
      return false
    }
  }
}

export default TimerControllers
