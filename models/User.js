const crypto = require('crypto');

function User(firstname, lastname, email, password, phone) {
    return {
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
                address: 'eth' + crypto.randomBytes(32).toString('hex'),
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'Shiba Inu',
                symbol: 'SHIB',
                address: 'shib' + crypto.randomBytes(31).toString('hex'),
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
            {
                name: 'SafeMoon',
                symbol: 'SAFEMOON',
                address: 'safemoon' + crypto.randomBytes(27).toString('hex'),
                values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            },
        ],
        transactionHistory: [],
    };
}
exports.User = User
