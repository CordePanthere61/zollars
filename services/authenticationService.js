const {User, newUser} = require("../models/User");
const bcrypt = require('bcrypt')
const Joi = require("joi");
const Password = require("joi-password-complexity");
const twoFactor = require('../utils/twoFactor')

const oneMonth = 2629800000;

async function login(req) {
    const {error} = validateLoginForm(req.body);
    if (error) {
        exports.errorMessages = error.details;
        return null;
    }
    let user = await User.findOne({email: req.body.email});
    if (!user) {
        exports.errorMessages = ['Email or password incorrect.'];
        return null;
    }
    const validPassword = await bcrypt.compare(req.body.password + process.env.PASSWORD_PEPPER, user.password);
    if (!validPassword) {
        exports.errorMessages = ['Email or password incorrect.'];
        return null;
    }
    if (req.body.remember_me) {
        req.session.cookie.maxAge = oneMonth;
    }
    return user;
}

async function register(req) {
    const {error} = validateRegisterForm(req.body);
    if (error) {
        exports.errorMessages = error.details
        return null;
    }
    let user = await User.findOne({email: req.body.email});
    if (user) {
        exports.errorMessages = 'Email already in use.';
        return null;
    }
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password + process.env.PASSWORD_PEPPER, salt);
    user = newUser(req.body.firstname, req.body.lastname, req.body.email, password, req.body.phone);
    await user.save();
    exports.successMessages = ['User successfully created.'];
    return user;
}

async function loginWithTwoFactor(req) {
    if (!twoFactor.validateCode(req.body.code)) {
        twoFactor.sendLoginCode(req.session.user);
        return false;
    }
    await logUser(req, req.session.user.email);
    return true;
}

async function logUser(req, email) {
    let user = await User.findOne({email: email});
    req.session.isLogged = true;
    req.session.user = {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        hasTwoFa: user.twoFaEnabled,
        phoneConfirmed: user.phoneConfirmed
    }
}

exports.logUser = logUser
exports.loginWithTwoFactor = loginWithTwoFactor
exports.register = register
exports.login = login

function validateLoginForm(form) {
    const schema = Joi.object().options({abortEarly: false}).keys( {
        email: Joi.string().required().email(),
        password: Joi.string().required(),
        remember_me: Joi.bool().optional(),
    });
    return schema.validate(form);
}

function validateRegisterForm(form) {
    const schema = Joi.object().options({abortEarly: false}).keys( {
        firstname: Joi.string().max(50).required(),
        lastname: Joi.string().max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: new Password({
            min: 8,
            max: 255,
            lowerCase: 1,
            upperCase: 1,
            numeric: 1
        }),
        phone: Joi.string().min(10).max(11).required()
    });
    return schema.validate(form);
}


