const testUtils = require('./utils')
const assert = require('chai').assert
const config = require('../config')
const axios = require('axios').default

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

const LOCALHOST = `http://localhost:${config.port}`

const context = {}

describe('Users', () => {
  before(async () => {
    // console.log(`config: ${JSON.stringify(config, null, 2)}`)

    // Create a second test user.
    const userObj = {
      email: 'test2@test.com',
      password: 'pass2'
    }
    const testUser = await testUtils.createUser(userObj)
    // console.log(`testUser2: ${JSON.stringify(testUser, null, 2)}`)

    context.user2 = testUser.user
    context.token2 = testUser.token
    context.id2 = testUser.user._id

    // Get the JWT used to log in as the admin 'system' user.
    const adminJWT = await testUtils.getAdminJWT()
    // console.log(`adminJWT: ${adminJWT}`)
    context.adminJWT = adminJWT

    // const admin = await testUtils.loginAdminUser()
    // context.adminJWT = admin.token

    // const admin = await adminLib.loginAdmin()
    // console.log(`admin: ${JSON.stringify(admin, null, 2)}`)
  })

  describe('POST /users', () => {
    it('should reject signup when data is incomplete', async () => {
      try {
        const options = {
          method: 'post',
          url: `${LOCALHOST}/users`,
          data: {
            email: 'test2@test.com'
          }
        }

        let result = await axios(options)

        console.log(`result stringified: ${JSON.stringify(result.data, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.response.status === 422) {
          assert(err.response.status === 422, 'Error code 422 expected.')
        } else if (err.response.status === 401) {
          assert(err.response.status === 401, 'Error code 401 expected.')
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should sign up', async () => {
      try {
        const options = {
          method: 'post',
          url: `${LOCALHOST}/users`,
          data: {
            user: {
              email: 'test3@test.com',
              password: 'supersecretpassword'
            }
          }
        }

        let result = await axios(options)
        // console.log(`result: ${JSON.stringify(result, null, 2)}`)

        context.user = result.data.user
        context.token = result.data.token

        assert(result.status === 200, 'Status Code 200 expected.')
        assert(
          result.data.user.email === 'test3@test.com',
          'Email of test expected'
        )
        assert(
          result.data.user.password === undefined,
          'Password expected to be omited'
        )
        assert.property(result.data, 'token', 'Token property exists.')
      } catch (err) {
        console.log(
          'Error authenticating test user: ' + JSON.stringify(err, null, 2)
        )
        throw err
      }
    })
  })

  describe('GET /users', () => {
    it('should not fetch users if the authorization header is missing', async () => {
      try {
        const options = {
          method: 'get',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json'
          }
        }

        await axios(options)

        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should not fetch users if the authorization header is missing the scheme', async () => {
      try {
        const options = {
          method: 'get',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json',
            Authorization: '1'
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should not fetch users if the authorization header has invalid scheme', async () => {
      const { token } = context
      try {
        const options = {
          method: 'get',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json',
            Authorization: `Unknown ${token}`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should not fetch users if token is invalid', async () => {
      try {
        const options = {
          method: 'get',
          url: `${LOCALHOST}/users`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer 1`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should fetch all users', async () => {
      const { token } = context

      const options = {
        method: 'get',
        url: `${LOCALHOST}/users`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }

      const result = await axios(options)
      const users = result.data.users
      // console.log(`users: ${util.inspect(users)}`)

      assert.hasAnyKeys(users[0], ['type', '_id', 'email'])
      assert.isNumber(users.length)
    })
  })

  describe('GET /users/:id', () => {
    it('should not fetch user if token is invalid', async () => {
      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/1`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer 1`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it("should throw 404 if user doesn't exist", async () => {
      const { token } = context

      try {
        const options = {
          method: 'GET',
          url: `${LOCALHOST}/users/1`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 404)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 404)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should fetch user', async () => {
      const {
        user: { _id },
        token
      } = context

      const options = {
        method: 'GET',
        url: `${LOCALHOST}/users/${_id}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }

      const result = await axios(options)
      const user = result.data.user
      // console.log(`user: ${util.inspect(user)}`)

      assert.hasAnyKeys(user, ['type', '_id', 'email'])
      assert.equal(user._id, _id)
      assert.notProperty(
        user,
        'password',
        'Password property should not be returned'
      )
    })
  })

  describe('PUT /users/:id', () => {
    it('should not update user if token is invalid', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/1`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer 1`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 401 if non-admin updating other user', async () => {
      const { token } = context

      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/1`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should update user', async () => {
      const {
        user: { _id },
        token
      } = context

      const options = {
        method: 'PUT',
        url: `${LOCALHOST}/users/${_id}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        },
        data: {
          user: { email: 'testToUpdate@test.com' }
        }
      }

      const result = await axios(options)
      const user = result.data.user
      // console.log(`user: ${util.inspect(user)}`)

      assert.hasAnyKeys(user, ['type', '_id', 'email'])
      assert.equal(user._id, _id)
      assert.notProperty(
        user,
        'password',
        'Password property should not be returned'
      )
      assert.equal(user.email, 'testToUpdate@test.com')
    })

    it('should not be able to update user type', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${context.user._id.toString()}`,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          data: {
            user: {
              name: 'new name',
              type: 'test'
            }
          }
        }

        let result = await axios(options)

        // console.log(`Users: ${JSON.stringify(result.data, null, 2)}`)

        assert(result.status === 200, 'Status Code 200 expected.')
        assert(result.data.user.type === 'user', 'Type should be unchanged.')
      } catch (err) {
        console.error('Error: ', err)
        console.log('Error stringified: ' + JSON.stringify(err, null, 2))
        throw err
      }
    })

    it('should not be able to update other user when not admin', async () => {
      try {
        const options = {
          method: 'PUT',
          url: `${LOCALHOST}/users/${context.user2._id.toString()}`,
          headers: {
            Authorization: `Bearer ${context.token}`
          },
          data: {
            user: {
              name: 'This should not work'
            }
          }
        }

        let result = await axios(options)

        console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should be able to update other user when admin', async () => {
      const adminJWT = context.adminJWT

      const options = {
        method: 'PUT',
        url: `${LOCALHOST}/users/${context.user2._id.toString()}`,
        headers: {
          Authorization: `Bearer ${adminJWT}`
        },
        data: {
          user: {
            name: 'This should work'
          }
        }
      }

      let result = await axios(options)
      // console.log(`result stringified: ${JSON.stringify(result, null, 2)}`)

      const userName = result.data.user.name
      assert.equal(userName, 'This should work')
    })
  })

  describe('DELETE /users/:id', () => {
    it('should not delete user if token is invalid', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/users/1`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer 1`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should throw 401 if deleting other user', async () => {
      const { token } = context

      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/users/1`,
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }

        await axios(options)
        assert.equal(true, false, 'Unexpected behavior')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should not be able to delete other users unless admin', async () => {
      try {
        const options = {
          method: 'DELETE',
          url: `${LOCALHOST}/users/${context.user2._id.toString()}`,
          headers: {
            Authorization: `Bearer ${context.token}`
          }
        }

        let result = await axios(options)

        console.log(`result stringified: ${JSON.stringify(result.data, null, 2)}`)
        assert(false, 'Unexpected result')
      } catch (err) {
        if (err.response.status) {
          assert.equal(err.response.status, 401)
        } else if (err.response.statusCode) {
          assert.equal(err.response.statusCode, 401)
        } else {
          console.error('Error: ', err)
          console.log('Error stringified: ' + JSON.stringify(err, null, 2))
          throw err
        }
      }
    })

    it('should delete own user', async () => {
      const {
        user: { _id },
        token
      } = context

      const options = {
        method: 'DELETE',
        url: `${LOCALHOST}/users/${_id}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      }

      const result = await axios(options)
      // console.log(`result: ${util.inspect(result.data.success)}`)

      assert.equal(result.data.success, true)
    })

    it('should be able to delete other users when admin', async () => {
      const id = context.id2
      const adminJWT = context.adminJWT

      const options = {
        method: 'DELETE',
        url: `${LOCALHOST}/users/${id}`,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${adminJWT}`
        }
      }

      const result = await axios(options)
      // console.log(`result: ${util.inspect(result.data)}`)

      assert.equal(result.data.success, true)
    })
  })
})
