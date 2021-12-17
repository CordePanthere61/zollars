$(document).ready(() =>  {
    setWalletAndAmountListeners();
    //setFormActionAndListener();
});

function setFormActionAndListener() {
    setFormAction();
    $('#wallet').change(setFormAction);
    $('#exchange').change(setFormAction);
}

function setWalletAndAmountListeners() {
    $('#wallet').change(function() {
        let amountInput = $('#amount');
        switch (this.value) {
            case "1":
                amountInput.val(wallets[1].values.at(-1));
                break;
            case "2":
                amountInput.val(wallets[2].values.at(-1));
                break;
            case "3":
                amountInput.val(wallets[3].values.at(-1));
                break;
        }
    })
}

function setFormAction() {
    let host = $('#exchange').val();
    let wallet = $('#wallet').val();
    $('#form').attr('action', 'http://' + exchanges[host].address + '/api/send/' + wallet);
}
