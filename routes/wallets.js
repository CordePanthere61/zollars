const express = require("express");
const router = express.Router();
const walletsService = require("../services/walletsService");
const session = require('../utils/session');

router.post('/my-balance/add-funds', session.middlewares.auth, (req, res) => {
    walletsService.addFundsToBalance(req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/wallets');
        })
        .catch(error=> {
            req.flash('errorMessages', error);
            res.redirect('/wallets');
        });
});

router.post('/my-balance/withdraw', session.middlewares.auth, (req, res) => {
    walletsService.withdrawFromBalance(req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/wallets');
        })
        .catch(error=> {
            req.flash('errorMessages', error);
            res.redirect('/wallets');
        });
});

router.post('/:symbol/buy', session.middlewares.auth, (req, res) => {
    walletsService.buyCrypto(req.params.symbol, req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/wallets');
        })
        .catch(error=> {
            req.flash('errorMessages', error);
            res.redirect('/wallets');
        });
});

router.post('/:symbol/sell', session.middlewares.auth, (req, res) => {
    walletsService.sellCrypto(req.params.symbol, req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/wallets');
        })
        .catch(error=> {
            req.flash('errorMessages', error);
            res.redirect('/wallets');
        });
})



module.exports = router