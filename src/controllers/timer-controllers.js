/*
  This Controller library is concerned with timer-based functions that are
  kicked off periodicially.
*/

import config from '../../config/index.js'

const checkOrdersPeriod = 60000 * 2 // 1 minute

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
    this.checkOrdersHandle = setInterval(this.checkOrders, checkOrdersPeriod)

    return true
  }

  stopTimers () {
    clearInterval(this.checkOrdersHandle)
  }

  // Check on any outstanding orders.
  async checkOrders () {
    try {
      console.log('checkOrders() time controller executed.')

      clearInterval(this.checkOrdersHandle)

      await this.useCases.order.checkOrders()

      this.checkOrdersHandle = setInterval(this.checkOrders, checkOrdersPeriod)

      return true
    } catch (err) {
      console.error('Error in checkOrders(): ', err)

      this.checkOrdersHandle = setInterval(this.checkOrders, checkOrdersPeriod)

      // Note: Do not throw an error. This is a top-level function.
      return false
    }
  }
}

export default TimerControllers
