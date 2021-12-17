const userBroker = require("../brokers/userBroker");

function addFundsToBalance(req) {
    return new Promise((resolve, reject) => {
        if (isNaN(req.body.amount)) {
            return reject('Amount is invalid.');
        }
        const amount = Number(req.body.amount)
        userBroker.addFunds(req.session.user.email, amount).then(() => {
            userBroker.insertNewTransaction(req.session.user.email, 'add', amount, 'USD').then(() => {
                resolve(amount.toFixed(2) + '$ has been added to your balance.');
            });
        });
    });
}

function withdrawFromBalance(req) {
    return new Promise((resolve, reject) => {
        if (isNaN(req.body.amount)) {
            return reject('Amount is invalid.');
        }
        const amount = Number(req.body.amount);
        userBroker.withdrawFunds(req.session.user.email, amount)
            .then(() => {
                userBroker.insertNewTransaction(req.session.user.email, 'withdraw', amount, 'USD').then(() => {
                    resolve(amount.toFixed(2) + '$ has been withdrew from your balance.')
                });
            })
            .catch(() => reject('Amount is invalid.'))
    });
}

function buyCrypto(symbol, req) {
    return new Promise((resolve, reject) => {
        if (isNaN(req.body.amount)) {
            return reject('Amount is invalid.');
        }
        userBroker.findWallets(req.session.user.email).then(wallets => {
            if (wallets[0].values.at(-1) < req.body.amount) {
                return reject('Not enough money.');
            }
            const amount = Number(req.body.amount);
            userBroker.addCrypto(req.session.user.email, wallets, amount, symbol)
                .then((transactionAmount) => {
                    userBroker.insertNewTransaction(req.session.user.email, 'buy', transactionAmount, symbol).then(() => {
                        resolve('Transaction successful.');
                    });
                })
                .catch(() => reject('An error has occurred.'));
        });
    });
}

function sellCrypto(symbol, req) {
    return new Promise((resolve, reject) => {
        if (isNaN(req.body.amount)) {
            return reject('Amount is invalid.');
        }
        const amount = Number(req.body.amount);
        userBroker.findWallets(req.session.user.email).then(wallets => {
            userBroker.removeCrypto(req.session.user.email, wallets, amount, symbol)
                .then((transactionAmount) => {
                    userBroker.insertNewTransaction(req.session.user.email, 'sell', transactionAmount, symbol).then(() => {
                        resolve('Transaction successful.');
                    });
                })
                .catch(error => reject(error));
        });
    });
}

exports.sellCrypto = sellCrypto
exports.buyCrypto = buyCrypto
exports.withdrawFromBalance = withdrawFromBalance
exports.addFundsToBalance = addFundsToBalance



