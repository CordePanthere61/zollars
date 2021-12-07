const twoFactor = require('node-2fa');
const {verifyToken} = require("node-2fa");
const client = require('twilio')("AC611dfbbb8504556fad9c7ca6384f8964", "cac3357e3476eff537e6f622e54e062d");

var secret = 'secret_token';

function sendPhoneConfirmation(user) {
    const newToken = twoFactor.generateToken(secret)
    client.messages
        .create({
            to: user.phone,
            from: '+17123877281',
            body: 'Phone confirmation : ' + newToken.token,
        })
        .then(message => console.log(message.sid));
}

function sendLoginCode(user) {
    const newToken = twoFactor.generateToken(secret, )
    client.messages
        .create({
            to: user.phone,
            from: '+17123877281',
            body: 'Login code : ' + newToken.token,
        })
        .then(message => console.log(message.sid));
}

function validateCode(code) {
    const result = verifyToken(secret, code);
    return result != null && result.delta === 0;
}

exports.sendLoginCode = sendLoginCode
exports.validateCode = validateCode
exports.sendPhoneConfirmation = sendPhoneConfirmation
