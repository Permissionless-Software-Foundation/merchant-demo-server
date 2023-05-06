/*
  This library encapsulates code concerned with MongoDB and Mongoose models.
*/

// Load Mongoose models.
import Users from './models/users.js'
import Orders from './models/orders.js'
import PaidOrders from './models/paid-orders.js'

class LocalDB {
  constructor () {
    // Encapsulate dependencies
    this.Users = Users
    this.Orders = Orders
    this.PaidOrders = PaidOrders
  }
}

export default LocalDB
