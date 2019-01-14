var bitcore = require('bitcore-lib-cash');
var config = require('./config.json');

module.exports = class Wallet {

    constructor(seed) {
        if (config.network == "testnet") {
            this.network = bitcore.Networks.testnet;
        } else {
            this.network = bitcore.Networks.mainnet;
        }

        let value = Buffer.from(seed);

        const hash = bitcore.crypto.Hash.sha256(value);
        const bn = bitcore.crypto.BN.fromBuffer(hash);

        this.privateKey = new bitcore.PrivateKey(bn, this.network)

        this.address = this.privateKey.toAddress(this.network);
    }

    GetAddres() {
        return this.address.toLegacyAddress();
    }

    GetCashAddress() {
        return this.address;
    }

    GetPrivKey() {
        return this.privateKey;
    }

}