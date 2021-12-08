const twoFactor = require('../utils/twoFactor')
const {User} = require('../models/User')
const Joi = require("joi");
const Password = require("joi-password-complexity");
const bcrypt = require("bcrypt");

async function validatePhoneConfirmation(req) {
    if (!twoFactor.validateCode(req.body.code)) {
        exports.errorMessages = 'Invalide code.';
        return false;
    }
    await User.findOneAndUpdate({email: req.session.user.email}, {phoneConfirmed: true}, {upsert: false});
    const user = await User.findOne({email: req.session.user.email});
    req.session.user = {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        hasTwoFa: user.twoFaEnabled,
        phoneConfirmed: user.phoneConfirmed
    };
    exports.successMessages = 'Phone successfully confirmed.';
    return true;
}

async function updateTwoFactor(req) {
    await User.findOneAndUpdate({email: req.session.user.email}, {twoFaEnabled: req.body.twoFa === 'on'}, {upsert: false});
    const user = await User.findOne({email: req.session.user.email});
    req.session.user = {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        hasTwoFa: user.twoFaEnabled,
        phoneConfirmed: user.phoneConfirmed
    };
    if (req.body.twoFa === 'on') {
        exports.successMessages = 'Phone added as a Two-Authentication Factor';
    } else {
        exports.successMessages = 'Phone removed as a Two-Authentication Factor';
    }
}

async function changePassword(req) {
    const {error} = validateChangePasswordForm(req.body);
    if (error) {
        exports.errorMessages = error.details
        return false;
    }
    if (req.body.password === req.body.newPassword) {
        exports.errorMessages = 'Passwords need to be different.';
        return false;
    }
    const user = await User.findOne({email: req.session.user.email});
    if (!await bcrypt.compare(req.body.password + process.env.PASSWORD_PEPPER, user.password)) {
        exports.errorMessages = 'Current password is incorrect.';
        return false;
    }
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(req.body.newPassword + process.env.PASSWORD_PEPPER, salt);
    await User.findOneAndUpdate({email: req.session.user.email}, {password: newPassword}, {upsert: false});
    exports.successMessages = 'Password changed successfully.';
    return true;
}

async function addCard(req) {
    const {error} = validateAddCardForm(req.body);
    if (error) {
        exports.errorMessages = error.details
        return false;
    }
    await User.findOneAndUpdate({email: req.session.user.email}, {
        card: {
            name: req.body.cardName,
            number: req.body.cardNumber,
            expirationDate: req.body.cardExpirationDate,
            cvc: req.body.cardCvc,
        }
    }, {upsert: false});
    exports.successMessages = 'Card successfully added.';
    return true;
}

async function removeCard(req) {
    await User.findOneAndUpdate({email: req.session.user.email}, {
        card: {
            name: null,
            number: null,
            expirationDate: null,
            cvc: null,
        }
    });
    exports.successMessages = 'Card successfully removed.';
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
    const schema = Joi.object().options({abortEarly: true}).keys({
        cardName: Joi.string().required(),
        cardNumber: Joi.string().required().min(16).max(16),
        cardExpirationDate: Joi.string().required().pattern(RegExp('^(0[1-9]|1[0-2])\\/([0-9]{2})$')).message('Expiration date must respect the format : MM/YY.'),
        cardCvc: Joi.string().min(3).max(3).required(),
    });
    return schema.validate(form);
}