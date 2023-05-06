/*
  Unit tests for the REST API handler for the /users endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'
import OrderController from '../../../../../src/controllers/rest-api/order/controller.js'

import { context as mockContext } from '../../../../unit/mocks/ctx-mock.js'
let uut
let sandbox
let ctx

describe('#Users-REST-Controller', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new OrderController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new OrderController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /order REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new OrderController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /order REST Controller.'
        )
      }
    })
  })

  describe('#POST /orders', () => {
    it('should call use case to create a new order', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.useCases.order, 'createOrder').resolves({
        bchAddr: 'fake-addr',
        bchPayment: 0.0001
      })

      ctx.request.body = {
        order: {}
      }

      await uut.createOrder(ctx)

      // console.log('ctx.body: ', ctx.body)

      assert.property(ctx.body, 'success')
      assert.property(ctx.body, 'bchAddr')
      assert.property(ctx.body, 'bchPayment')
    })

    it('should return 422 status on biz logic error', async () => {
      try {
        await uut.createOrder(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })
  })

  describe('GET /payment/:bchAddr', () => {
    it('should return 422 status on arbitrary biz logic error', async () => {
      try {
        // Force an error
        sandbox
          .stub(uut.useCases.order, 'checkPayment')
          .rejects(new Error('test error'))

        await uut.checkPayment(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.status, 422)
      }
    })

    it('should return 200 status on success', async () => {
      ctx.params = {
        bchAddr: 'fake-addr'
      }

      await uut.checkPayment(ctx)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      // Assert that expected properties exist in the returned data.
      assert.property(ctx.response.body, 'paid')
    })
  })

  describe('#handleError', () => {
    it('should still throw error if there is no message', () => {
      try {
        const err = {
          status: 404
        }

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'Not Found')
      }
    })

    it('should still throw error if the is a message', () => {
      try {
        const err = new Error('test error')
        err.status = 404

        uut.handleError(ctx, err)
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })
  })
})
