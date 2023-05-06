/*
  Mocks for the Adapter library.
*/

class WalletAdapter {
  constructor() {

  }

  async incrementNextAddress() {
    return {}
  }

  async getKeyPair() {
    return {}
  }
}

class IpfsAdapter {
  constructor () {
    this.ipfs = {
      files: {
        stat: () => {}
      }
    }
  }
}

class IpfsCoordAdapter {
  constructor () {
    this.ipfsCoord = {
      useCases: {
        peer: {
          sendPrivateMessage: () => {}
        }
      }
    }
  }
}

const ipfs = {
  ipfsAdapter: new IpfsAdapter(),
  ipfsCoordAdapter: new IpfsCoordAdapter()
}
ipfs.ipfs = ipfs.ipfsAdapter.ipfs

const localdb = {
  Users: class Users {
    static findById () {}
    static find () {}
    static findOne () {
      return {
        validatePassword: localdb.validatePassword
      }
    }

    async save () {
      return {}
    }

    generateToken () {
      return '123'
    }

    toJSON () {
      return {}
    }

    async remove () {
      return true
    }

    async validatePassword () {
      return true
    }
  },

  validatePassword: () => {
    return true
  },

  Orders: class Orders {
    static find () {}
    static async deleteOne() {}

    async save () {
      return {}
    }
  },

  PaidOrders: class PaidOrders {
    static find () {}
    static findOne () {
      return {}
    }

    async save () {
      return {}
    }
  }
}

const wallet = {
  getUsd: async () => {},
  bchjs: {
    Util: {
      floor8: () => 0.01
    },
    BitcoinCash: {
      toBitcoinCash: () => 0.0001
    }
  },
  getBalance: async () => 1000
}

const psfMsg = {
  encryptAndUpload: async () => {},
  sendMsgSignal: async () => {}
}

export default { ipfs, localdb, walletAdapter: new WalletAdapter(), wallet, psfMsg };
