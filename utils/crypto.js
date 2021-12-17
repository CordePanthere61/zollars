const axios = require('axios');

const transferResponseMessages = [
    {
        status: 200,
        message: 'Transfer successful.'
    },
    {
        status: 500,
        message: 'An error has occurred, please try again later.',
    },
    {
        status: 400,
        message: 'Invalid quantity',
    },
    {
        status: 401,
        message: 'Unsupported crypto',
    },
    {
        status: 402,
        message: 'The specified wallet doesn\'t support this crypto.',
    },
    {
        status: 404,
        message: 'Invalid address.',
    },
]

async function getWalletIndexAndMarketValue(symbol) {
    switch (symbol) {
        case 'ETH':
            return {
                index: 1,
                marketValue: await getEthereumValue()
            }
        case 'SHIB':
            return {
                index: 2,
                marketValue: await getShibaInuValue()
            }
        case 'SAFEMOON':
            return {
                index: 3,
                marketValue: await getSafemoonValue()
            }
    }
}

async function getMarketValues() {
    return {
        ethereum: await getEthereumValue(),
        shiba: await getShibaInuValue(),
        safemoon: await getSafemoonValue()
    }
}

function getExchanges() {
    return [
        {
            id: 0,
            name: 'Cryptonix',
            address: '206.167.241.102'
        },
        {
            id: 1,
            name: 'Plutus',
            address: '206.167.241.107'
        },
        {
            id: 2,
            name: 'Cipher',
            address: '206.167.241.104'
        },
        {
            id: 3,
            name: 'Golem',
            address: '206.167.241.105'
        },
    ];
}

function sendCrypto(hostId, symbol, data) {
    return new Promise((resolve, reject) => {
        console.log(getExchanges());
        let host = getExchanges().find(x => x.id === Number(hostId)).address
        axios.post('http://' + host + '/api/send/' + symbol, data, {timeout: 5000})
            .then(res => {
                resolve(transferResponseMessages.find(x => x.status === res.status).message);
            })
            .catch((res) => {
                if (!res.response) {
                    reject('Java leak screwing us. (Host is down)');
                }
            })
    });
}
exports.sendCrypto = sendCrypto
exports.getMarketValues = getMarketValues
exports.getWalletIndexAndMarketValue = getWalletIndexAndMarketValue
exports.getExchanges = getExchanges

function getEthereumValue() {
    return axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=85640fa0-a255-4b29-9b27-08aadf8bf863&symbol=ETH')
        .then(res => res.data.data.ETH.quote.USD.price)
        .catch(error => error);
}

function getShibaInuValue() {
    return axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=85640fa0-a255-4b29-9b27-08aadf8bf863&symbol=SHIB')
        .then(res => res.data.data.SHIB.quote.USD.price)
        .catch(error => error);
}

function getSafemoonValue() {
    return axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=85640fa0-a255-4b29-9b27-08aadf8bf863&symbol=SAFEMOON')
        .then(res => res.data.data.SAFEMOON.quote.USD.price)
        .catch(error => error);
}
