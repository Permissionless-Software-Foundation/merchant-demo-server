/*
  REST API Controller library for the /order route
*/

// import wlogger from '../../../adapters/wlogger.js'

class OrderRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /order REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /order REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.UserModel = this.adapters.localdb.Users
    // this.userUseCases = this.useCases.user

    // Bind 'this' to all subfunctions
    this.createOrder = this.createOrder.bind(this)
    this.handleError = this.handleError.bind(this)
    this.checkPayment = this.checkPayment.bind(this)
  }

  /**
   * @api {post} /order Create a new order
   * @apiPermission public
   * @apiName Create Order
   * @apiGroup REST Orders
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "order": { "emailAddress": "email@format.com", "shippingName": "my name", "shippingAddress": "123 Somewhere", "qty": 1 } }' localhost:5010/order
   *
   */
  async createOrder (ctx) {
    try {
      console.log('createOrder() called')
      console.log('ctx.request.body: ', ctx.request.body)

      const orderObj = ctx.request.body.order

      const { bchPayment, bchAddr } = await this.useCases.order.createOrder(orderObj)

      ctx.body = {
        success: true,
        bchAddr,
        bchPayment
      }
    } catch (err) {
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /order/payment/:bchAddr Get user by id
   * @apiPermission public
   * @apiName Check Payment
   * @apiGroup REST Orders
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5010/order/payment/bitcoincash:qpvgdxgj6nw2cxyhnnsqlz9k6dwptgtrxgv7ne86tv
   *
   */

  // Check if a payment has been processed.
  async checkPayment (ctx) {
    try {
      // console.log('checkPayment() called')
      // console.log('ctx.params: ', ctx.params)

      const bchAddr = ctx.params.bchAddr

      const paid = await this.useCases.order.checkPayment({ bchAddr })

      ctx.body = {
        paid
      }
    } catch (err) {
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

export default OrderRESTControllerLib
