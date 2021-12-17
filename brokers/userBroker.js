const {User} = require('../models/User');
const crypto = require('../utils/crypto');
const {connectToDb, userCollection} = require('../utils/database');
const {reject} = require("bcrypt/promises");
const moment = require("moment");

async function find() {
    const db = await connectToDb();
    return new Promise(async resolve => {
        const users = await db.collection(userCollection).find().toArray();
        resolve(users);
    });
}

async function findOne(email) {
    const db = await connectToDb();
    return new Promise((resolve, reject) => {
        db.collection(userCollection).findOne({email: email})
            .then(user => {
                if (user) {
                    return resolve(user);
                }
                reject();
            })
    });
}

async function findOneAndUpdate(email, update, options = {new: true, upsert: false}) {
    const db = await connectToDb();
    return new Promise(resolve => {
        db.collection(userCollection).findOneAndUpdate({email: email}, {"$set": update}, options, (err, doc) => {
            if (doc) {
                resolve(doc.value);
            }
        });
    });
}

async function findWallets(email) {
    const db = await connectToDb();
    return new Promise((resolve, reject) => {
        db.collection(userCollection).findOne({email: email}, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.wallets)
            }
        });
    });
}

async function findTransactionHistory(email, latest = false) {
    const db = await connectToDb();
    return new Promise((resolve, reject) => {
        db.collection(userCollection).findOne({email: email}, (err, res) => {
            if (err) {
                reject(err);
            } else {
                if (latest) {
                    resolve(res.transactionHistory.slice(0, 5));
                } else {
                    resolve(res.transactionHistory);
                }
            }
        });
    });
}

async function findCard(email) {
    const db = await connectToDb();
    return new Promise((resolve, reject) => {
        db.collection(userCollection).findOne({email: email}, (err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res.card);
            }
        });
    });
}

async function insertNewUser(user) {
    const db = await connectToDb();
    return new Promise(resolve=> {
        db.collection(userCollection).insertOne(user);
        resolve(user);
    });
}

function addFunds(email, amount) {
    return new Promise(resolve => {
        findWallets(email).then(wallets => {
            wallets[0].values.shift();
            wallets[0].values.push(wallets[0].values.at(-1) + amount);
            findOneAndUpdate(email, {'wallets' : wallets}).then(() => resolve());
        })
    });
}

async function withdrawFunds(email, amount) {
    return new Promise((resolve, reject) => {
        findWallets(email).then(wallets => {
            if (wallets[0].values.at(-1) < amount) {
                return reject();
            }
            wallets[0].values.shift();
            wallets[0].values.push(wallets[0].values.at(-1) - amount);
            findOneAndUpdate(email, {'wallets' : wallets}).then(() => resolve());
        });
    });
}

function addCrypto(email, wallets, amountUSD, symbol) {
    return new Promise((resolve, reject) => {
        crypto.getWalletIndexAndMarketValue(symbol).then(walletInfos => {
            if (isNaN(walletInfos.marketValue)) {
                return reject();
            }
            wallets[walletInfos.index].values.shift();
            wallets[walletInfos.index].values.push(wallets[walletInfos.index].values.at(-1) + amountUSD / walletInfos.marketValue);
            wallets[0].values.shift();
            wallets[0].values.push(wallets[0].values.at(-1) - amountUSD);
            findOneAndUpdate(email, {'wallets' : wallets}).then(() => resolve(amountUSD / walletInfos.marketValue));
        });
    });
}

function removeCrypto(email, wallets, amount, symbol) {
    return new Promise((resolve, reject) => {
        crypto.getWalletIndexAndMarketValue(symbol).then(walletInfos => {
            if (isNaN(walletInfos.marketValue)) {
                return reject('An error has occurred.');
            }
            if (wallets[walletInfos.index].values.at(-1) < amount) {
                return reject('Amount is invalid.');
            }
            wallets[walletInfos.index].values.shift();
            wallets[walletInfos.index].values.push(wallets[walletInfos.index].values.at(-1) - amount);
            wallets[0].values.shift();
            wallets[0].values.push(wallets[0].values.at(-1) + amount * walletInfos.marketValue);
            findOneAndUpdate(email, {'wallets' : wallets}).then(() => resolve(amount));
        });
    });
}

function insertNewTransaction(email, type, amount, wallet) {
    return new Promise(resolve => {
        findTransactionHistory(email).then(transactions => {
            transactions.unshift({
                date: moment().format('YYYY/MM/DD'),
                type: type,
                amount: amount,
                wallet: wallet
            });
            findOneAndUpdate(email, {transactionHistory: transactions}).then(() => {
                resolve();
            });
        });
    });
}

async function findUserAndWalletWithAddress(address) {
    let db = await connectToDb();
    return new Promise(async (resolve, reject) => {
        db.collection(userCollection).findOne({wallets: {"$elemMatch" : {address: address}}})
            .then(res => {
                console.log(res);
                if (res) {
                    return resolve({user: res, wallet: res.wallets.find(x => x.address === address)});
                } else {
                    return reject();
                }
            });
    });
}

exports.find = find
exports.findOne = findOne
exports.findWallets = findWallets
exports.findTransactionHistory = findTransactionHistory
exports.findCard = findCard
exports.findOneAndUpdate = findOneAndUpdate
exports.insertNewUser = insertNewUser
exports.addFunds = addFunds
exports.withdrawFunds = withdrawFunds
exports.addCrypto = addCrypto
exports.removeCrypto = removeCrypto
exports.insertNewTransaction = insertNewTransaction
exports.findUserAndWalletWithAddress = findUserAndWalletWithAddress
