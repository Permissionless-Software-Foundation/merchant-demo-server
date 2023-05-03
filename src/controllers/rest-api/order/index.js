/*
  REST API library for /orders route, to handle new orders.
*/

// Public npm libraries.
import Router from 'koa-router'

// Local libraries.
import OrderRESTControllerLib from './controller.js'

import Validators from '../middleware/validators.js'

// let _this

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

    // _this = this
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.post('/', this.orderRESTController.createOrder)
    // this.router.get('/', this.getAll)
    // this.router.get('/:id', this.getById)
    // this.router.put('/:id', this.updateUser)
    // this.router.delete('/:id', this.deleteUser)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }

  // async getAll (ctx, next) {
  //   await _this.validators.ensureUser(ctx, next)
  //   await _this.orderRESTController.getUsers(ctx, next)
  // }
  //
  // async getById (ctx, next) {
  //   await _this.validators.ensureUser(ctx, next)
  //   await _this.orderRESTController.getUser(ctx, next)
  // }
  //
  // async updateUser (ctx, next) {
  //   await _this.validators.ensureTargetUserOrAdmin(ctx, next)
  //   await _this.orderRESTController.getUser(ctx, next)
  //   await _this.orderRESTController.updateUser(ctx, next)
  // }
  //
  // async deleteUser (ctx, next) {
  //   await _this.validators.ensureTargetUserOrAdmin(ctx, next)
  //   await _this.orderRESTController.getUser(ctx, next)
  //   await _this.orderRESTController.deleteUser(ctx, next)
  // }
}

export default UserRouter
