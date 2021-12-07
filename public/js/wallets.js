let ethereumValue;
let shibValue;
let safemoonValue;

$(document).ready(() =>  {
    setCryptosCurrentPrices();
});

function setCryptosCurrentPrices() {
    fetchCrypto('ethereum').then(r => {
        ethereumValue = r.market_data.current_price.usd;
        $('#ethMarketValue').html(r.market_data.current_price.usd + ' $')
    });
    fetchCrypto('shiba-inu').then(r => {
        shibValue = r.market_data.current_price.usd;
        $('#shibMarketValue').html(r.market_data.current_price.usd + ' $')
    });
    fetchCrypto('safemoon').then(r => {
        safemoonValue = r.market_data.current_price.usd;
        $('#safemoonMarketValue').html(r.market_data.current_price.usd + ' $')
    });
}

async function fetchCrypto(name) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${name}`);
        const crypto = await response.json();
        return crypto;
    } catch (error) {
        console.log(error);
    }
}