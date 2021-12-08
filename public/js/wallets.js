$(document).ready(() =>  {
    setCryptosCurrentPrices();
});

function setCryptosCurrentPrices() {
    fetchCrypto('ethereum').then(r => {
        let ethereumValue = r.market_data.current_price.usd;
        setListenersForTransactionConverters('Eth', ethereumValue);
        $('#ethMarketValue').html(ethereumValue + ' $');
        $('#ethValueUSD').html((wallets[1].values.at(-1) * ethereumValue).toFixed(2) + ' $ (USD)');
    });
    fetchCrypto('shiba-inu').then(r => {
        let shibValue = r.market_data.current_price.usd;
        setListenersForTransactionConverters('Shib', shibValue);
        $('#shibMarketValue').html(shibValue + ' $');
        $('#shibValueUSD').html((wallets[2].values.at(-1) * shibValue).toFixed(2) + ' $ (USD)');
    });
    fetchCrypto('safemoon').then(r => {
        let safemoonValue = r.market_data.current_price.usd;
        setListenersForTransactionConverters('Safemoon', safemoonValue);
        $('#safemoonMarketValue').html(safemoonValue + ' $');
        $('#safemoonValueUSD').html((wallets[3].values.at(-1) * safemoonValue).toFixed(2) + ' $ (USD)');
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

function setListenersForTransactionConverters(symbol, valueUSD) {
    $(`#buy${symbol}InputUSD`).on('change keyup',(e) => {
        $(`#buy${symbol}Input`).val(Number(e.target.value) / valueUSD);
    });
    $(`#sell${symbol}Input`).on('change keyup',(e) => {
        $(`#sell${symbol}InputUSD`).val(Number(e.target.value) * valueUSD + ' $');
    });
}