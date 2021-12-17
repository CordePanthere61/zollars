$(document).ready(() =>  {
    setCryptosCurrentPrices();
    initCharts();
});

function initCharts() {
    initChart('myBalanceChart', wallets[0]);
    initChart('ethereumChart', wallets[1]);
    initChart('shibChart', wallets[2]);
    initChart('safemoonChart', wallets[3]);
}

function initChart(id, wallet) {
    echarts.init(document.querySelector(`#${id}`)).setOption({
        xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: wallet.values.slice(-7),
            type: 'line',
            smooth: true
        }],
        color: '#F0B90B'
    });
}

function setCryptosCurrentPrices() {
    fetchCrypto().then(market => {
        setListenersForTransactionConverters('Eth', market.ethereum);
        $('#ethMarketValue').html(market.ethereum + ' $');
        $('#ethValueUSD').html((wallets[1].values.at(-1) * market.ethereum).toFixed(2) + ' $ (USD)');

        setListenersForTransactionConverters('Shib', market.shiba);
        $('#shibMarketValue').html(market.shiba + ' $');
        $('#shibValueUSD').html((wallets[2].values.at(-1) * market.shiba).toFixed(2) + ' $ (USD)');

        setListenersForTransactionConverters('Safemoon', market.safemoon);
        $('#safemoonMarketValue').html(market.safemoon + ' $');
        $('#safemoonValueUSD').html((wallets[3].values.at(-1) * market.safemoon).toFixed(2) + ' $ (USD)');
    });
}

function fetchCrypto() {
    return new Promise(resolve => {
        fetch(`/api/market-values`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then(res => res.json())
            .then(res => {
                resolve(res)
            });
    });
}

function setListenersForTransactionConverters(symbol, valueUSD) {
    $(`#buy${symbol}InputUSD`).on('change keyup',(e) => {
        $(`#buy${symbol}Input`).val(Number(e.target.value) / valueUSD);
    });
    $(`#sell${symbol}Input`).on('change keyup',(e) => {
        $(`#sell${symbol}InputUSD`).val(Number(e.target.value) * valueUSD + ' $');
    });
}