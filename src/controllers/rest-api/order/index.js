/*
  REST API library for /orders route, to handle new orders.
*/

// Public npm libraries.
import Router from 'koa-router'

// Local libraries.
import OrderRESTControllerLib from './controller.js'

import Validators from '../middleware/validators.js'

class UserRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Order REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Order REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.orderRESTController = new OrderRESTControllerLib(dependencies)
    this.validators = new Validators()

    // Instantiate the router and set the base route.
    const baseUrl = '/order'
    this.router = new Router({ prefix: baseUrl })
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.post('/', this.orderRESTController.createOrder)
    this.router.get('/payment/:bchAddr', this.orderRESTController.checkPayment)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

export default UserRouter
