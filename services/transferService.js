const userBroker = require('../brokers/userBroker');
const crypto = require('../utils/crypto');
const Joi = require("joi");
const {getExchanges} = require("../utils/crypto");

function sendCryptoToExchange(req) {
    return new Promise((resolve, reject) => {
        const {error} = validateTransferForm(req.body);
        if (error) {
            return reject(error.details);
        }
        userBroker.findOne(req.session.user.email).then(user => {
            if (user.wallets[req.body.wallet].values.at(-1) < req.body.amount) {
                reject('Invalid amount.');
            }
            crypto.sendCrypto(req.body.exchange, user.wallets[req.body.wallet].symbol,
                {
                    amount: req.body.amount,
                    address: req.body.address,
                    fromAddress: user.wallets[req.body.wallet].address
                })
                .then(() => {
                    userBroker.removeCrypto(user.email, user.wallets, req.body.amount, user.wallets[req.body.wallet].symbol)
                        .then(() => {
                            resolve('Transaction to' + getExchanges().find(x => x.id === Number(req.body.exchange)).name + ' successfull.');
                        });
                })
                .catch(error => {
                    reject(error);
                });
        });
    });
}

exports.sendCryptoToExchange = sendCryptoToExchange


function validateTransferForm(form) {
    const schema = Joi.object().options({abortEarly: false}).keys( {
        wallet: Joi.number().min(1).max(3),
        exchange: Joi.number().min(0).max(3),
        amount: Joi.number().required(),
        address: Joi.string().required(),
    });
    return schema.validate(form);
}