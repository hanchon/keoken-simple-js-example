var bitcore = require('bitcore-lib-cash');

var Explorer = require('./explorer.js');
var Wallet = require('./wallet.js');
var Config = require('./config.json');

let insight = new Explorer(Config.insightUrl);

async function CreateAndSendTx(wallet, destinty, opRetOutput) {
    try {
        let res = await insight.GetUtxos(wallet.GetAddres());
        let utxos = insight.ParseUtxos(res, Config.wallet.minAmountSatToOperate);

        // Create the transaction
        var tx = new bitcore.Transaction()
            .from(utxos)
            .to(destinty, 2000)
            .addOutput(opRetOutput)
            .change(wallet.GetAddres())
            .sign(wallet.GetPrivKey());

        // Send the transaction
        let sent = await insight.SendTransaction(tx.serialize({
            disableDustOutputs: true
        }));

        if (!sent) {
            console.error("Error sending the transaction");
            return false;
        }
    } catch (error) {
        console.error("Error generating the transaction: " + error);
        return false;
    }
    return true;
}

async function SendToken(wallet, destinty, asset, amount) {

    var op_ret_script = new bitcore.Script();
    op_ret_script.add(bitcore.Opcode.OP_RETURN);
    op_ret_script.add(new Buffer("00004b50", 'hex'))
    const tempHeader = "00000001";
    const tempAsset = ("00000000" + Number(asset).toString(16)).substr(-8);
    const tempAmount = ("0000000000000000" + Number(amount).toString(16)).substr(-16);
    op_ret_script.add(new Buffer(tempHeader + tempAsset + tempAmount, 'hex'));
    var opRetOutput = new bitcore.Transaction.Output({
        script: op_ret_script,
        satoshis: 0
    });

    try {
        let sent = await CreateAndSendTx(wallet, destinty, opRetOutput);
        if (!sent) {
            console.error("Error sending the tokens");
            return false;
        }
    } catch (e) {
        console.error("Error sending a token:" + error);
        return false;
    }

    return true;

}

async function CreateAsset(wallet, name, amount) {

    var op_ret_script = new bitcore.Script();
    op_ret_script.add(bitcore.Opcode.OP_RETURN);
    op_ret_script.add(new Buffer("00004b50", 'hex'))
    const tempHeader = "00000000";
    const tempName = (Buffer.from(name, 'utf8').toString('hex')) + '00';
    const tempAmount = ("0000000000000000" + Number(amount).toString(16)).substr(-16);
    op_ret_script.add(new Buffer(tempHeader + tempName + tempAmount, 'hex'));
    var opRetOutput = new bitcore.Transaction.Output({
        script: op_ret_script,
        satoshis: 0
    });

    try {
        let sent = await CreateAndSendTx(wallet, wallet.GetAddres(), opRetOutput);
        if (!sent) {
            console.error("Error sending the tokens");
            return false;
        }
    } catch (e) {
        console.error("Error sending a token:" + error);
        return false;
    }

    return true;

}



(async () => {
    try {
        const wallet = new Wallet(Config.wallet.mainSeed)
        if (process.argv[2] === "showMainWallet") {
            console.log("Legacy:" + wallet.GetAddres());
            console.log("CashAddr:" + wallet.GetCashAddress());
        } else if (process.argv[2] === "sendToken") {
            // Arg 3 destinty 
            // Arg 4 asset id
            // Arg 5 amount
            let res = await SendToken(wallet, process.argv[3], process.argv[4], process.argv[5]);
            if (res) {
                console.log("Token sent");
            } else {
                console.error("Error sending the token");
            }
        } else if (process.argv[2] === "createAsset") {
            // Arg 3 asset name
            // Arg 4 amount
            let res = await CreateAsset(wallet, process.argv[3], process.argv[4]);
            if (res) {
                console.log("CreateAsset sent");
            } else {
                console.error("Error sending the create asset message");
            }
        }
    } catch (e) {
        console.error(e);
    }
})()