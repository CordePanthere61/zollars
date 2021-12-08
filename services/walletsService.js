const userBroker = require("../brokers/userBroker");
const {isNumeric} = require("validator");
const fetch = require('cross-fetch');

async function addFundsToBalance(req) {
    if (!isNumeric(req.body.amount)) {
        exports.errorMessages = 'Amount is invalid.'
        return false;
    }
    const amount = Number(req.body.amount)
    await userBroker.addFunds(req.session.user.email, amount);
    exports.successMessages = amount.toFixed(2) + '$ has been added to your balance.';
    return true;
}

async function withdrawFromBalance(req) {
    if (!isNumeric(req.body.amount)) {
        exports.errorMessages = 'Amount is invalid.';
        return false;
    }
    const amount = Number(req.body.amount);
    if (!await userBroker.withdrawFunds(req.session.user.email, amount)) {
        exports.errorMessages = 'Amount is invalid.';
        return false;
    }
    exports.successMessages = amount.toFixed(2) + '$ has been withdrew from your balance.';
    return true;
}

async function buyCrypto(symbol, req) {
    if (!isNumeric(req.body.amount)) {
        exports.errorMessages = 'Amount is invalid.'
        return false;
    }
    const query = await userBroker.getWallets(req.session.user.email);
    let wallets = query.wallets;
    if (wallets[0].values.at(-1) < req.body.amount) {
        exports.errorMessages = 'Not enough money.'
        return false;
    }
    const amount = Number(req.body.amount);
    await userBroker.addCrypto(req.session.user.email, wallets, amount, symbol)
    exports.successMessages = 'Transaction successful.';
    return true;
}

async function sellCrypto(symbol, req) {
    if (!isNumeric(req.body.amount)) {
        exports.errorMessages = 'Amount is invalid.'
        return false;
    }
    const amount = Number(req.body.amount);
    if (!await userBroker.removeCrypto(req.session.user.email, amount, symbol)) {
        exports.errorMessages = 'Amount is invalid.';
        return false;
    }
    exports.successMessages = 'Transaction successful.';
    return true;
}

exports.sellCrypto = sellCrypto
exports.buyCrypto = buyCrypto
exports.withdrawFromBalance = withdrawFromBalance
exports.addFundsToBalance = addFundsToBalance
