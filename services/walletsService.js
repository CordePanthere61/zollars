const {getUserWallets, updateUserWallets} = require("../models/User");
const {isNumeric} = require("validator");
const fetch = require('cross-fetch');

async function addFundsToBalance(req) {
    if (!isNumeric(req.body.amount)) {
        exports.errorMessages = 'Amount is invalid.'
        return false;
    }
    const amount = Number(req.body.amount)
    const queryWallets = await getUserWallets(req.session.user.email);
    const wallets = queryWallets.wallets;
    wallets[0].values.shift();
    wallets[0].values.push(wallets[0].values.at(-1) + amount);
    await updateUserWallets(req.session.user.email, wallets);
    exports.successMessages = amount.toFixed(2) + '$ has been added to your balance.';
    return true;
}

async function withdrawFromBalance(req) {
    if (!isNumeric(req.body.amount)) {
        exports.errorMessages = 'Amount is invalid.'
        return false;
    }
    const amount = Number(req.body.amount)
    const queryWallets = await getUserWallets(req.session.user.email);
    let wallets = queryWallets.wallets;
    if (wallets[0].values.at(-1) < amount) {
        exports.errorMessages = 'Amount is invalid.';
        return false;
    }
    wallets[0].values.shift();
    wallets[0].values.push(wallets[0].values.at(-1) - amount);
    await updateUserWallets(req.session.user.email, wallets);
    exports.successMessages = amount.toFixed(2) + '$ has been withdraw from your balance.';
    return true;
}

async function buyCrypto(symbol, req) {
    if (!isNumeric(req.body.amount)) {
        exports.errorMessages = 'Amount is invalid.'
        return false;
    }
    const query = await getUserWallets(req.session.user.email);
    let wallets = query.wallets;
    if (wallets[0].values.at(-1) < req.body.amount) {
        exports.errorMessages = 'Not enough money.'
        return false;
    }
    if (symbol === 'eth') {
        return await buyEthereum(wallets, req);
    }
}

exports.buyCrypto = buyCrypto
exports.withdrawFromBalance = withdrawFromBalance
exports.addFundsToBalance = addFundsToBalance

async function buyEthereum(wallets, req) {

    await fetch('https://api.coingecko.com/api/v3/coins/ethereum').then(r => r.json()).then(async (r) => {
        let ethAmount = Number(req.body.amount) / r.market_data.current_price.usd;
        wallets[1].values.shift();
        wallets[1].values.push(wallets[1].values.at(-1) + ethAmount);
        wallets[0].values.shift();
        wallets[0].values.push(wallets[0].values.at(-1) - Number(req.body.amount));
        await updateUserWallets(req.session.user.email, wallets);
    });
    exports.successMessages = wallets[1].values.at(-1) + ' ETH added to your wallet.'
    return true;
}
