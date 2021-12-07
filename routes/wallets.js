const express = require("express");
const router = express.Router();
const walletsService = require("../services/walletsService");
const session = require('../utils/session');

router.post('/my-balance/add-funds', session.middlewares.auth, async (req, res) => {
    if (await walletsService.addFundsToBalance(req)) {
        req.flash('successMessages', walletsService.successMessages);
    } else {
        req.flash('errorMessages', walletsService.errorMessages);
    }
    res.redirect('/wallets');
});

router.post('/my-balance/withdraw', session.middlewares.auth, async (req, res) => {
    if (await walletsService.withdrawFromBalance(req)) {
        req.flash('successMessages', walletsService.successMessages);
    } else {
        req.flash('errorMessages', walletsService.errorMessages);
    }
    res.redirect('/wallets');
});

router.post('/:symbol/buy', async (req, res) => {
    if (await walletsService.buyCrypto(req.params.symbol, req)) {
        req.flash('successMessages', walletsService.successMessages);
    } else {
        req.flash('errorMessages', walletsService.errorMessages);
    }
    res.redirect('/wallets');

});

module.exports = router