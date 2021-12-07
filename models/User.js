const mongoose = require('mongoose');

const User = mongoose.model('User', new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    phone: String,
    twoFaEnabled: { type: Boolean, default: false },
    phoneConfirmed: { type: Boolean, default: false },
    card: {
        name: String,
        number: String,
        expirationDate: String,
        cvc: String,
    },
    wallets: [
        {
            name: String,
            symbol: String,
            values: Array
        }
    ]
}));

function newUser(firstname, lastname, email, password, phone) {
    return new User({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
        phone: phone,
        card: {
            name: null,
            number: null,
            expirationDate: null,
            cvc: null,
        },
        wallets: [
            {
                name: 'My Balance',
                symbol: 'USD',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'Etherum',
                symbol: 'ETH',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'Shiba Inu',
                symbol: 'SHIB',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'SafeMoon',
                symbol: 'SAFEMOON',
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
        ],
    })
}

async function getUserWallets(email) {
    return User.findOne({email: email}, 'wallets');
}

async function updateUserWallets(email, wallets) {
    console.log('before update', wallets);
    await User.findOneAndUpdate({email: email}, {wallets: wallets});
}

async function getUserCard(email) {
    return User.findOne({email: email}, 'card');
}

exports.updateUserWallets = updateUserWallets
exports.getUserCard = getUserCard
exports.newUser = newUser
exports.getUserWallets = getUserWallets
exports.User = User
