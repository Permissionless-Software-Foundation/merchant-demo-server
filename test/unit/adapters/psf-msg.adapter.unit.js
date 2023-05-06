/*
  Unit tests for the IPFS Adapter.
*/

// Global npm libraries.
import { assert } from 'chai'
import sinon from 'sinon'
import BchWallet from 'minimal-slp-wallet'

// Local libraries.
import PsfMsgAdapter from '../../../src/adapters/psf-msg.js'
// import create from '../mocks/ipfs-mock.js'
// import config from '../../../config/index.js'

describe('#psf-msg-adapter', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    const wallet = new BchWallet()
    await wallet.walletInfoPromise

    uut = new PsfMsgAdapter({ wallet })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('#constructor', () => {
    it('should throw an error if wallet is not included', () => {
      try {
        uut = new PsfMsgAdapter()
        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(err.message, 'Must pass instance of wallet when instantiating PsfMsgAdapter.')
      }
    })
  })

  describe('#encryptMsg()', () => {
    it('should return the encrypted message.', async () => {
      const pubKey = '02723ba5cfb47ee86c804bcd1270939374ed50016c15607580d79d0119608c1e39'
      const msg = 'message'
      const result = await uut.encryptMsg(pubKey, msg)
      // console.log('result: ', result)

      assert.isString(result)
    })

    it('should throw an error if pubKey is not provided.', async () => {
      try {
        await uut.encryptMsg()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'pubKey must be a string',
          'Expected error message.'
        )
      }
    })

    it('should throw an error if msg is not provided.', async () => {
      try {
        const pubKey = '02723ba5cfb47ee86c804bcd1270939374ed50016c15607580d79d0119608c1e39'
        await uut.encryptMsg(pubKey)

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'msg must be a string',
          'Expected error message.'
        )
      }
    })
  })

  describe('#signalMessage()', () => {
    it('should throw an error if hash is not provided.', async () => {
      try {
        await uut.signalMessage()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'hash must be a string',
          'Expected error message.'
        )
      }
    })

    it('should throw an error if bchAddress is not provided.', async () => {
      try {
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'

        await uut.signalMessage({ hash })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'bchAddress must be a string',
          'Expected error message.'
        )
      }
    })

    it('should throw an error if subject is not provided.', async () => {
      try {
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
        const bchAddress =
          'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'

        await uut.signalMessage({ hash, bchAddress })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'subject must be a string',
          'Expected error message.'
        )
      }
    })

    it('should return transaction hex.', async () => {
      // Mock dependencies and force desired code path.
      uut.MsgLib = class MsgLib {
        constructor () {
          this.memo = {
            writeMsgSignal: async () => 'tx-hex'
          }
        }
      }

      const bchAddress =
        'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
      const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
      const subject = 'subject'

      const result = await uut.signalMessage({ hash, bchAddress, subject })
      assert.isString(result)
    })

    it('should throw error if cant build the tx', async () => {
      // Mock dependencies and force desired code path.
      uut.MsgLib = class MsgLib {
        constructor () {
          this.memo = {
            writeMsgSignal: async () => null
          }
        }
      }

      try {
        const bchAddress =
          'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
        const subject = 'subject'

        await uut.signalMessage({ hash, bchAddress, subject })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Could not build a hex transaction',
          'Expected error message.'
        )
      }
    })
  })

  describe('#encryptAndUpload', () => {
    it('should encrypt the message and upload it to the P2WDB', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.wallet, 'getPubKey').resolves('fake-pubkey')
      sandbox.stub(uut, 'encryptMsg').resolves('fake-encrypted-message')
      uut.BchWallet = class BchWallet {
        constructor () {
          this.initialize = async () => {}
        }
      }
      uut.Write = class Write {
        constructor () {
          this.postEntry = async () => { return { hash: 'fake-hash' } }
        }
      }

      const inObj = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
        message: 'test message',
        wif: 'fake-wif'
      }

      const result = await uut.encryptAndUpload(inObj)

      assert.equal(result, 'fake-hash')
    })
  })

  describe('#signalMessage()', () => {
    it('should throw an error if hash is not provided.', async () => {
      try {
        await uut.signalMessage()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'hash must be a string',
          'Expected error message.'
        )
      }
    })

    it('should throw an error if bchAddress is not provided.', async () => {
      try {
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'

        await uut.signalMessage({ hash })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'bchAddress must be a string',
          'Expected error message.'
        )
      }
    })

    it('should throw an error if subject is not provided.', async () => {
      try {
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
        const bchAddress =
          'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'

        await uut.signalMessage({ hash, bchAddress })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'subject must be a string',
          'Expected error message.'
        )
      }
    })

    it('should return transaction hex.', async () => {
      // Mock dependencies and force desired code path.
      uut.MsgLib = class {
        constructor () {
          this.memo = {
            writeMsgSignal: async () => 'fake-txid'
          }
        }
      }

      const bchAddress =
        'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
      const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
      const subject = 'subject'

      const result = await uut.signalMessage({ hash, bchAddress, subject })
      assert.isString(result)
    })

    it('should throw error if cant build the tx', async () => {
      try {
        // Mock dependencies and force desired code path.
        uut.MsgLib = class {
          constructor () {
            this.memo = {
              writeMsgSignal: async () => null
            }
          }
        }

        const bchAddress =
          'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3'
        const hash = 'QmYJXDxuNjwFuAYaUdADPnxKZJhQSsx69Ww2rGk6VmAFQu'
        const subject = 'subject'

        await uut.signalMessage({ hash, bchAddress, subject })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Could not build a hex transaction',
          'Expected error message.'
        )
      }
    })
  })

  describe('#sendMsgSignal', () => {
    it('should generate a PS001 message and broadcast it', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.wallet.bchjs.Util, 'sleep').resolves()
      uut.BchWallet = class BchWallet {
        constructor () {
          this.initialize = async () => {}
          this.ar = {
            sendTx: async () => 'fake-txid'
          }
        }
      }
      sandbox.stub(uut, 'signalMessage').resolves('fake-hex')

      const flags = {
        bchAddress: 'bitcoincash:qpufm97hppty67chexq4p53vc29mzg437vwp7huaa3',
        hash: 'fake hash',
        subject: 'Test',
        wif: 'fake-wif'
      }

      const result = await uut.sendMsgSignal(flags)

      assert.equal(result, 'fake-txid')
    })
  })
})
