/*
  Use-case library for new orders. This library contains business logic for
  working with orders.
*/

class OrdersUseCases {
  constructor (localConfig = {}) {
    // Dependency Injection
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Orders Use Cases library.'
      )
    }

    // Bind 'this' object to all subfunctions
    this.createOrder = this.createOrder.bind(this)
  }

  // Create a new order.
  async createOrder (inObj = {}) {
    try {
      console.log(`createOrder() inObj: ${JSON.stringify(inObj, null, 2)}`)

      console.log('this.adapters.wallet: ', this.adapters.wallet)

      // Get a new keypair from the wallet.
      const nextIndex = await this.adapters.walletAdapter.incrementNextAddress()
      const keyPair = await this.adapters.walletAdapter.getKeyPair(nextIndex)
      console.log('keyPair: ', keyPair)

      inObj.wif = keyPair.wif
      inObj.hdIndex = keyPair.hdIndex
      inObj.bchAddr = keyPair.cashAddress

      // Save the order to the database.
      const order = new this.adapters.localdb.Orders(inObj)
      await order.save()
      console.log(`order: ${JSON.stringify(order, null, 2)}`)

      return inObj.bchAddr
    } catch (err) {
      console.error('Error in createOrder(): ', err)
      throw err
    }
  }
}

export default OrdersUseCases
