const {User} = require('../models/User');
const crypto = require('../utils/crypto')

async function getWallets(email) {
    return User.findOne({email: email}, 'wallets');
}

async function updateWallets(email, wallets) {
    console.log('before update', wallets);
    await User.findOneAndUpdate({email: email}, {wallets: wallets});
}

async function getCard(email) {
    return User.findOne({email: email}, 'card');
}

async function addFunds(email, amount) {
    const query = await getWallets(email);
    const wallets = query.wallets;
    wallets[0].values.shift();
    wallets[0].values.push(wallets[0].values.at(-1) + amount);
    await updateWallets(email, wallets);
}

async function withdrawFunds(email, amount) {
    const query = await getWallets(email);
    let wallets = query.wallets;
    if (wallets[0].values.at(-1) < amount) {
        return false;
    }
    wallets[0].values.shift();
    wallets[0].values.push(wallets[0].values.at(-1) - amount);
    await updateWallets(email, wallets);
    return true;
}

async function addCrypto(email, wallets, amountUSD, symbol) {
    let walletInfos = await crypto.getWalletIndexAndMarketValue(symbol);
    wallets[walletInfos.index].values.shift();
    wallets[walletInfos.index].values.push(wallets[walletInfos.index].values.at(-1) + amountUSD / walletInfos.marketValue);
    wallets[0].values.shift();
    wallets[0].values.push(wallets[0].values.at(-1) - amountUSD);
    await updateWallets(email, wallets);
}

async function removeCrypto(email, amount, symbol) {
    let walletInfos = await crypto.getWalletIndexAndMarketValue(symbol);
    const query = await getWallets(email);
    let wallets = query.wallets;
    if (wallets[walletInfos.index].values.at(-1) < amount) {
        return false;
    }
    wallets[walletInfos.index].values.shift();
    wallets[walletInfos.index].values.push(wallets[walletInfos.index].values.at(-1) - amount);
    wallets[0].values.shift();
    wallets[0].values.push(wallets[0].values.at(-1) + amount * walletInfos.marketValue);
    await updateWallets(email, wallets);
    return true;
}

exports.removeCrypto = removeCrypto
exports.getWallets = getWallets
exports.updateWallets = updateWallets
exports.getCard = getCard
exports.addFunds = addFunds
exports.withdrawFunds = withdrawFunds
exports.addCrypto = addCrypto
