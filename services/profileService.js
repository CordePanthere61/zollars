const twoFactor = require('../utils/twoFactor');
const {User} = require('../models/User');
const userBroker = require('../brokers/userBroker');
const Joi = require("joi");
const Password = require("joi-password-complexity");
const bcrypt = require("bcrypt");
const {reject} = require("bcrypt/promises");

function validatePhoneConfirmation(req) {
    return new Promise((resolve, reject) =>  {
        if (!twoFactor.validateCode(req.body.code)) {
            return reject('Invalide code.');
        }
        userBroker.findOneAndUpdate(req.session.user.email, {"phoneConfirmed": true})
            .then(() => {
                   req.session.user.phoneConfirmed = true
                   resolve('Phone successfully confirmed.');
            });
    });
}

function updateTwoFactor(req) {
    return new Promise(resolve => {
        let twoFa = req.body.twoFa === 'on';
        userBroker.findOneAndUpdate(req.session.user.email, {"twoFaEnabled": twoFa})
            .then(() => {
                req.session.user.twoFaEnabled = twoFa;
                if (twoFa) {
                    resolve('Phone added as a Two-Authentication Factor');
                } else {
                    resolve('Phone removed as a Two-Authentication Factor');
                }
            });
    });
}

function changePassword(req) {
    return new Promise((resolve, reject) => {
        const {error} = validateChangePasswordForm(req.body);
        if (error) {
            return reject(error.details);
        }
        if (req.body.password === req.body.newPassword) {
            return reject('Passwords need to be different.');
        }
        userBroker.findOne(req.session.user.email)
            .then(async (user) => {
                if (!await bcrypt.compare(req.body.password + process.env.PASSWORD_PEPPER, user.password)) {
                    reject('Current password is incorrect.');
                }
                const salt = await bcrypt.genSalt(10);
                const newPassword = await bcrypt.hash(req.body.newPassword + process.env.PASSWORD_PEPPER, salt);
                userBroker.findOneAndUpdate(req.session.user.email, {password: newPassword})
                    .then(() => {
                        resolve('Password changed successfully.');
                    });

            });
    });
}

//TODO encrypter le number de la credit card

function addCard(req) {
    return new Promise((resolve, reject) => {
        const {error} = validateAddCardForm(req.body);
        if (error) {
            return reject(error.details);
        }
        userBroker.findOneAndUpdate(req.session.user.email,{
            card: {
                name: req.body.cardName,
                number: req.body.cardNumber,
                expirationDate: req.body.cardExpirationDate,
                cvc: req.body.cardCvc,
            }
        }).then(() => { resolve('Card successfully added.'); });
    });
}

function removeCard(req) {
    return new Promise(resolve => {
        userBroker.findOneAndUpdate(req.session.user.email, {
            card: {
                name: null,
                number: null,
                expirationDate: null,
                cvc: null,
            }
        }).then(() => {
            resolve('Card successfully removed.');
        });

    });
}

exports.removeCard = removeCard
exports.addCard = addCard
exports.changePassword = changePassword
exports.updateTwoFactor = updateTwoFactor
exports.validatePhoneConfirmation = validatePhoneConfirmation

function validateChangePasswordForm(form) {
    const schema = Joi.object().options({abortEarly: false}).keys( {
        password: Joi.string().required(),
        newPassword: new Password({
            min: 8,
            max: 255,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1
        }),
    });
    return schema.validate(form);
}

function validateAddCardForm(form) {
    const schema = Joi.object().options({abortEarly: false}).keys({
        cardName: Joi.string().required(),
        cardNumber: Joi.string().required().min(16).max(16),
        cardExpirationDate: Joi.string().required().pattern(RegExp('^(0[1-9]|1[0-2])\\/([0-9]{2})$')).message('Expiration date must respect the format : MM/YY.'),
        cardCvc: Joi.string().min(3).max(3).required(),
    });
    return schema.validate(form);
}