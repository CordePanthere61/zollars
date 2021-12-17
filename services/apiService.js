const userBroker = require('../brokers/userBroker');

const statusCodes = {
    SUCCESS: 200,
    INVALID_AMOUNT: 400,
    INVALID_SYMBOL: 401,
    INVALID_SYMBOL_AND_ADDRESS: 402,
    INVALID_ADDRESS: 404,
    INTERNAL_ERROR: 500
}

const supportedSymbols = {
    ETH: 'ETH',
    SHIB: 'SHIB',
    SAFEMOON: 'SAFEMOON'
}

function receiveCrypto(req) {
    return new Promise((resolve, reject) => {
        if (req.params.symbol !== supportedSymbols.ETH &&
            req.params.symbol !== supportedSymbols.SHIB &&
            req.params.symbol !== supportedSymbols.SAFEMOON) {
            return reject(statusCodes.INVALID_SYMBOL)
        }
        userBroker.findUserAndWalletWithAddress(req.body.address)
            .then(query => {
                if (req.params.symbol !== query.wallet.symbol) {
                    return reject(statusCodes.INVALID_SYMBOL_AND_ADDRESS);
                }
                if (isNaN(req.body.amount) || Number(req.body.amount) <= 0) {
                    return reject(statusCodes.INVALID_AMOUNT);
                }
                let lastAmount = query.user.wallets.find(x => x.address === req.body.address).values.at(-1);
                query.user.wallets.find(x => x.address === req.body.address).values.shift();
                query.user.wallets.find(x => x.address === req.body.address).values.push(lastAmount + Number(req.body.amount));
                userBroker.findOneAndUpdate(query.user.email, {wallets: query.user.wallets})
                    .then(() => {
                        userBroker.insertNewTransaction(query.user.email, 'transfer', req.body.amount, req.params.symbol)
                            .then(() => {
                                return resolve(statusCodes.SUCCESS);
                            })
                            .catch(() => {
                                return reject(statusCodes.INTERNAL_ERROR);
                            })
                    })
                    .catch(() => {
                        return reject(statusCodes.INTERNAL_ERROR);
                    });
            })
            .catch(() => {
                reject(statusCodes.INVALID_ADDRESS);
            });
    });
}

exports.receiveCrypto = receiveCrypto