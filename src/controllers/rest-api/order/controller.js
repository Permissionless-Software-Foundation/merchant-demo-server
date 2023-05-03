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
  }

  /**
   * @api {post} /order Create a new order
   * @apiPermission public
   * @apiName CreateOrder
   * @apiGroup REST Orders
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "user": { "email": "email@format.com", "name": "my name", "password": "secretpasas" } }' localhost:5010/users
   *
   * @apiParam {Object} user          User object (required)
   * @apiParam {String} user.email Email
   * @apiParam {String} user.password Password
   * @apiParam {String} user.name name or handle
   *
   * @apiSuccess {Object}   users           User object
   * @apiSuccess {ObjectId} users._id       User id
   * @apiSuccess {String}   user.type       User type (admin or user)
   * @apiSuccess {String}   users.name      User name
   * @apiSuccess {String}   users.username  User username
   * @apiSuccess {String}   users.email     User email
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "user": {
   *          "_id": "56bd1da600a526986cf65c80"
   *          "name": "John Doe"
   *          "email": "email@format.com",
   *          "password": "somestrongpassword"
   *       }
   *     }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async createOrder (ctx) {
    try {
      console.log('createOrder() called')
      console.log('ctx.request.body: ', ctx.request.body)

      const orderObj = ctx.request.body.order

      const bchAddr = await this.useCases.order.createOrder(orderObj)

      ctx.body = {
        success: true,
        bchAddr
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
