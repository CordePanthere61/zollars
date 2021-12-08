const fetch = require('cross-fetch');

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

async function getEthereumValue() {
    return await fetch('https://api.coingecko.com/api/v3/coins/ethereum').then(r => r.json()).then(r => {
        return r.market_data.current_price.usd;
    });
}

async function getShibaInuValue() {
    return await fetch('https://api.coingecko.com/api/v3/coins/shiba-inu').then(r => r.json()).then(r => {
        return r.market_data.current_price.usd;
    });
}

async function getSafemoonValue() {
    return await fetch('https://api.coingecko.com/api/v3/coins/safemoon').then(r => r.json()).then(r => {
        return r.market_data.current_price.usd;
    });
}

exports.getWalletIndexAndMarketValue = getWalletIndexAndMarketValue
