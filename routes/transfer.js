const express = require('express');
const router = express.Router();
const session = require('../utils/session');
const transferService = require('../services/transferService');

router.post('/send', session.middlewares.auth ,(req, res) => {
    console.log(req.body);
    transferService.sendCryptoToExchange(req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/transfer');
        })
        .catch(error => {
            console.log(error);
            req.flash('errorMessages', error);
            res.redirect('/transfer');
        });
});

module.exports = router;