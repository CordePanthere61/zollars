const {User} = require("../models/User");
const userBroker = require('../brokers/userBroker');
const bcrypt = require('bcrypt');
const Joi = require("joi");
const Password = require("joi-password-complexity");
const twoFactor = require('../utils/twoFactor');

const oneMonth = 2629800000;

function login(req) {
    return new Promise((resolve, reject) => {
        const {error} = validateLoginForm(req.body);
        if (error) {
            return reject(error.details);
        }
        userBroker.findOne(req.body.email)
            .then(user => {
                bcrypt.compare(req.body.password + process.env.PASSWORD_PEPPER, user.password).then(result => {
                    if (!result) {
                        reject(['Email or password incorrect.']);
                    }
                    if (req.body.remember_me) {
                        req.session.cookie.maxAge = oneMonth;
                    }
                    resolve(user);
                });
            }).catch(() => {
                reject(['Email or password incorrect.']);
            });
    });
}

function register(req) {
    debugger;
    return new Promise((resolve, reject) => {
        const {error} = validateRegisterForm(req.body);
        if (error) {
            return reject(error.details);
        }
        userBroker.findOne(req.body.email)
            .then(() => {
                return reject('Email already in use.');
            })
            .catch(async() => {
                const salt = await bcrypt.genSalt(10);
                const password = await bcrypt.hash(req.body.password + process.env.PASSWORD_PEPPER, salt);
                userBroker.insertNewUser(new User(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    password,
                    req.body.phone)).then(() => {
                    resolve('User successfully created.');
                });
            });
    });
}

function loginWithTwoFactor(req) {
    return new Promise((resolve, reject) => {
        if (!twoFactor.validateCode(req.body.code)) {
            twoFactor.sendLoginCode(req.session.user);
            return reject('Invalide code.');
        }
        logUser(req, req.session.user.email).then(() => {
            resolve();
        });
    });
}

function logUser(req, email) {
    return new Promise(resolve => {
        userBroker.findOne(email)
            .then(user => {
                req.session.isLogged = true;
                req.session.user = {
                    id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    phone: user.phone,
                    twoFaEnabled: user.twoFaEnabled,
                    phoneConfirmed: user.phoneConfirmed
                }
                resolve();
            });
    });
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


