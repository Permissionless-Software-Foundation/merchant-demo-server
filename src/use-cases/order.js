/*
  Use-case library for new orders. This library contains business logic for
  working with orders.
*/

// Local libraries
import config from '../../config/index.js'

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

    // Encapsulate dependencies
    this.config = config
  }

  // Create a new order.
  async createOrder (inObj = {}) {
    try {
      console.log(`createOrder() inObj: ${JSON.stringify(inObj, null, 2)}`)

      // Get a new keypair from the wallet.
      const nextIndex = await this.adapters.walletAdapter.incrementNextAddress()
      const keyPair = await this.adapters.walletAdapter.getKeyPair(nextIndex)
      console.log('keyPair: ', keyPair)

      // Add properties to the database object
      inObj.wif = keyPair.wif
      inObj.hdIndex = keyPair.hdIndex
      inObj.bchAddr = keyPair.cashAddress

      // Convert the USD price to a quantity of BCH
      const productPrice = this.config.productPrice
      const usdPerBch = await this.adapters.wallet.getUsd()
      const qtyInt = parseInt(inObj.qty)
      let bchPayment = qtyInt * (productPrice / usdPerBch)
      bchPayment = this.adapters.wallet.bchjs.Util.floor8(bchPayment)
      console.log(`bchPayment: ${bchPayment}`)
      inObj.bchPayment = bchPayment

      // Save the order to the database.
      const order = new this.adapters.localdb.Orders(inObj)
      await order.save()
      console.log(`order: ${JSON.stringify(order, null, 2)}`)

      const outObj = {
        bchPayment,
        bchAddr: inObj.bchAddr
      }

      return outObj
    } catch (err) {
      console.error('Error in createOrder(): ', err)
      throw err
    }
  }

  // This function is called by a Timer Controller. It periodically checks on
  // all the orders in the database. If an order has been paid, then a message
  // is sent to the merchant. If the order is older than 24 hours, then the
  // order is deleted from the database.
  async checkOrders () {
    try {
      console.log('checkOrders() use-case executed.')

      // Get all orders from the database.
      const orders = await this.adapters.localdb.Orders.find({})
      console.log(`There are ${orders.length} orders in the database.`)

      // Check the balance of each order.
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i]

        // Get the balance of the order.
        const balanceSats = await this.adapters.wallet.getBalance(order.bchAddr)
        console.log(`balanceSats: ${JSON.stringify(balanceSats, null, 2)}`)
        const balance = this.adapters.bchjs.BitcoinCash.toBitcoinCash(balanceSats)
        console.log(`balance: ${balance}`)
        console.log(`order.bchPayment: ${order.bchPayment}`)

        // If the balance is sufficient, then send a message to the merchant,
        // and delete the order from the database.
        if (balance >= order.bchPayment) {
          console.log(`Order ${order._id} has been paid.`)

          // Send a message to the merchant.
          await this.sendMessage({ order })

          // Add the order to the paidOrder database model
          const paidOrderInput = order.toObject()
          console.log(`paidOrderInput: ${JSON.stringify(paidOrderInput, null, 2)}`)
          delete paidOrderInput._id
          delete paidOrderInput.__v
          console.log(`paidOrderInput: ${JSON.stringify(paidOrderInput, null, 2)}`)

          const paidOrder = new this.adapters.localdb.PaidOrders(paidOrderInput)
          await paidOrder.save()
          console.log('paidOrder: ', paidOrder)

          // Delete the order from the database.
          await this.adapters.localdb.Orders.deleteOne({ _id: order._id })
        }
      }

      // If the order is older than 24 hours, then delete the order from the database.

      return true
    } catch (err) {
      console.error('Error in checkOrders(): ', err)

      // Note: Do not throw an error. This is a top-level function.
      return false
    }
  }

  // Send an e2ee message to the merchant.
  async sendMessage (inObj = {}) {
    try {
      const { order } = inObj
      console.log(`sendMessage() order: ${JSON.stringify(order, null, 2)}`)

      // Send a message to the merchant.
      const orderDetails = JSON.stringify(order, null, 2)
      const message = `Order ${order._id} has been paid.\norderDetails: ${orderDetails}`

      const hash = await this.adapters.psfMsg.encryptAndUpload({
        bchAddress: this.config.merchantAddr,
        message,
        wif: order.wif
      })

      const txid = await this.adapters.psfMsg.sendMsgSignal({
        bchAddress: this.config.merchantAddr,
        subject: 'Order Paid',
        hash,
        wif: order.wif
      })

      return txid
    } catch (err) {
      console.error('Error in sendMessage(): ', err)
      throw err
    }
  }
}

export default OrdersUseCases
