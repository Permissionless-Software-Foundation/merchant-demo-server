/*
  Unit tests for the orders use-cases library.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import OrderUseCase from '../../../src/use-cases/order.js'
import adapters from '../mocks/adapters/index.js'

describe('#orders-use-case', () => {
  let uut
  let sandbox

  before(async () => {
    // Delete all previous users in the database.
    // await testUtils.deleteAllUsers()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new OrderUseCase({ adapters })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new OrderUseCase()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating Orders Use Cases library.'
        )
      }
    })
  })

  describe('#createOrder', () => {
    it('should create a new order', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.wallet, 'getUsd').resolves(123)

      const inObj = {
        emailAddress: 'test@test.com',
        shippingName: 'test',
        shippingAddress: '123 test ave',
        qty: '1'
      }

      const result = await uut.createOrder(inObj)
      // console.log('result: ', result)

      assert.property(result, 'bchPayment')
      assert.property(result, 'bchAddr')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.wallet, 'getUsd').rejects(new Error('test error'))

        const inObj = {
          emailAddress: 'test@test.com',
          shippingName: 'test',
          shippingAddress: '123 test ave',
          qty: '1'
        }

        await uut.createOrder(inObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#checkOrders', () => {
    it('should check orders and process a payment', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.localdb.Orders, 'find').resolves([{
        bchPayment: 0.000005,
        toObject: () => {
          return {
            _id: 'fake-id'
          }
        }
      }])
      sandbox.stub(uut, 'sendMessage').resolves()

      const result = await uut.checkOrders()

      assert.equal(result, true)
    })

    it('should delete orders older than a day', async () => {
      // Mock dependencies and force desired code path.
      const now = new Date()
      sandbox.stub(uut.adapters.localdb.Orders, 'find').resolves([{
        bchPayment: 0.000005,
        toObject: () => {
          return {
            _id: 'fake-id'
          }
        },
        timestamp: now.getTime() - 24 * 65 * 60000
      }])
      sandbox.stub(uut, 'sendMessage').resolves()

      const result = await uut.checkOrders()

      assert.equal(result, true)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.localdb.Orders, 'find').rejects(new Error('test error'))

        await uut.checkOrders()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#sendMessage', () => {
    it('should send a message to the merchant', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.psfMsg, 'encryptAndUpload').resolves('fake-hash')
      sandbox.stub(uut.adapters.psfMsg, 'sendMsgSignal').resolves('fake-txid')

      const result = await uut.sendMessage({ order: {} })

      assert.equal(result, 'fake-txid')
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.psfMsg, 'encryptAndUpload').rejects(new Error('test error'))

        await uut.sendMessage({ order: {} })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })

  describe('#checkPayment', () => {
    it('should return true if payment has been processed', async () => {
      const inObj = {
        bchAddr: 'fake-addr'
      }

      const result = await uut.checkPayment(inObj)

      assert.equal(result, true)
    })

    it('should return false if payment has not yet been processed', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.localdb.PaidOrders, 'findOne').resolves(false)

      const inObj = {
        bchAddr: 'fake-addr'
      }

      const result = await uut.checkPayment(inObj)

      assert.equal(result, false)
    })

    it('should catch and throw an error', async () => {
      try {
        // Force an error
        sandbox.stub(uut.adapters.localdb.PaidOrders, 'findOne').rejects(new Error('test error'))

        const inObj = {
          bchAddr: 'fake-addr'
        }

        await uut.checkPayment(inObj)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
