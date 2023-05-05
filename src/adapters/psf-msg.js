/*
    Adapter library for sending messages to blockchain addresses using the P2WDB.
    Messages can be recieved and read using psf-bch-wallet CLI app.
*/

// Global npm libraries
import EncryptLib from 'bch-encrypt-lib'
import { Write } from 'p2wdb'
import MsgLib from 'bch-message-lib'
import BchWallet from 'minimal-slp-wallet'

class PsfMsgAdapter {
  constructor (localConfig = {}) {
    // Dependency Injection
    this.wallet = localConfig.wallet
    if (!this.wallet) {
      throw new Error('Must pass instance of wallet when instantiating PsfMsgAdapter.')
    }

    // Encapsulate dependencies
    this.encryptLib = new EncryptLib({ bchjs: this.wallet.bchjs })
    // this.msg = new MsgLib({ wallet: this.wallet })
    // this.write = new Write({ bchWallet: this.wallet })
  }

  // Encrypt the message and upload it to the P2WDB.
  async encryptAndUpload (inObj = {}) {
    const { bchAddress, message, wif } = inObj

    // Get public Key for reciever from the blockchain.
    console.log(`bchAddress: ${bchAddress}`)
    const publicKey = await this.wallet.getPubKey(bchAddress)
    // const publicKey = pubKey.pubkey.publicKey
    console.log(`publicKey: ${JSON.stringify(publicKey, null, 2)}`)

    // Encrypt the message using the recievers public key.
    const encryptedMsg = await this.encryptMsg(publicKey, message)
    console.log(`encryptedMsg: ${JSON.stringify(encryptedMsg, null, 2)}`)

    // Upload the encrypted message to the P2WDB.
    const appId = 'merchant-new-order'
    const data = {
      now: new Date(),
      data: encryptedMsg
    }

    // Instantiate minimal-slp-wallet using the WIF of the order, so that
    // the new order is used to pay for the message.
    const wallet = new BchWallet(wif, { interface: 'consumer-api' })
    await wallet.initialize()

    // Instantiate the P2WDB write library with the new wallet
    const write = new Write({ bchWallet: wallet })

    const result = await write.postEntry(data, appId)
    console.log(`Data about P2WDB write: ${JSON.stringify(result, null, 2)}`)

    const hash = result.hash

    // Return the hash used to uniquly identify this entry in the P2WDB.
    return hash
  }

  // Encrypt a message using encryptLib
  async encryptMsg (pubKey, msg) {
    try {
      // Input validation
      if (!pubKey || typeof pubKey !== 'string') {
        throw new Error('pubKey must be a string')
      }
      if (!msg || typeof msg !== 'string') {
        throw new Error('msg must be a string')
      }

      const buff = Buffer.from(msg)
      const hex = buff.toString('hex')

      const encryptedStr = await this.encryptLib.encryption.encryptFile(
        pubKey,
        hex
      )
      // console.log(`encryptedStr: ${JSON.stringify(encryptedStr, null, 2)}`)

      return encryptedStr
    } catch (error) {
      console.log('Error in encryptMsg()')
      throw error
    }
  }

  // Generate and broadcast a PS001 message signal.
  async sendMsgSignal (inObj = {}) {
    const { bchAddress, subject, hash, wif } = inObj

    // Wait a couple seconds to let the indexer update its UTXO state.
    await this.wallet.bchjs.Util.sleep(2000)

    // Instantiate minimal-slp-wallet using the WIF of the order, so that
    // the new order is used to pay for the message.
    const wallet = new BchWallet(wif, { interface: 'consumer-api' })
    await wallet.initialize()

    // Instantiate the P2WDB write library with the new wallet
    // const write = new Write({ bchWallet: wallet })

    // Update the UTXO store in the wallet.
    // await this.wallet.initialize()

    // Sign Message
    const txHex = await this.signalMessage({ hash, bchAddress, subject, wallet })

    // Broadcast Transaction
    const txidStr = await wallet.ar.sendTx(txHex)
    console.log(`Transaction ID : ${JSON.stringify(txidStr, null, 2)}`)

    return txidStr
  }

  // Generate a PS001 signal message to write to the blockchain.
  // https://github.com/Permissionless-Software-Foundation/specifications/blob/master/ps001-media-sharing.md
  async signalMessage (inObj) {
    try {
      const { hash, bchAddress, subject, wallet } = inObj

      if (!hash || typeof hash !== 'string') {
        throw new Error('hash must be a string')
      }
      if (!bchAddress || typeof bchAddress !== 'string') {
        throw new Error('bchAddress must be a string')
      }
      if (!subject || typeof subject !== 'string') {
        throw new Error('subject must be a string')
      }

      const msg = new MsgLib({ wallet })

      // Generate the hex transaction containing the PS001 message signal.
      const txHex = await msg.memo.writeMsgSignal(
        hash,
        [bchAddress],
        subject
      )

      if (!txHex) {
        throw new Error('Could not build a hex transaction')
      }

      return txHex
    } catch (error) {
      console.log('Error in signalMessage')
      throw error
    }
  }
}

export default PsfMsgAdapter
