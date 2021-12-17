const express = require('express');
const router = express.Router();
const authService = require('../services/authenticationService')
const session = require('../utils/session')
const twoFactor = require("../utils/twoFactor");
const userBroker = require('../brokers/userBroker')
const crypto = require('../utils/crypto');

// GET

router.get('/', session.middlewares.auth , (req, res, next) => {
    userBroker.findWallets(req.session.user.email)
        .then(wallets => {
            userBroker.findTransactionHistory(req.session.user.email, true).then(transactions => {
                console.log(transactions);
                crypto.getMarketValues().then(values => {
                    res.render('app/dashboard', {title: 'Dashboard', wallets: wallets, transactions: transactions, marketValues: values});
                });
            });
        });
});

router.get('/wallets', session.middlewares.auth , (req, res, next) => {
    userBroker.findWallets(req.session.user.email)
        .then(wallets => {
            console.log(wallets);
            userBroker.findCard(req.session.user.email)
                .then(card => {
                    res.render('app/wallets', {title: 'Wallets', wallets: wallets, card: card});
                });
        });
});

router.get('/transaction-history', session.middlewares.auth ,(req, res, next) => {
    userBroker.findTransactionHistory(req.session.user.email).then(transactions => {
        res.render('app/transaction-history', {title: 'Transaction history', transactions: transactions});
    });
});

router.get('/transfer',  session.middlewares.auth, (req, res) => {
    userBroker.findWallets(req.session.user.email).then(wallets => {
        res.render('app/transfer', {title: 'Transfer', wallets: wallets, exchanges: crypto.getExchanges()});
    });
});

router.get('/profile', session.middlewares.auth , (req, res, next) => {
    userBroker.findOne(req.session.user.email).then(user => {
        console.log(user);
    });
    userBroker.findCard(req.session.user.email)
        .then(card => {
            res.render('app/profile', {title: 'Profile', card: card});
        });
});

router.get('/register', session.middlewares.notAuth, (req, res, next) => {
    res.render('authentication/register', {title: 'Register'});
});

router.get('/logout', session.middlewares.auth, (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/login', session.middlewares.notAuth, (req, res, next) => {
    req.session.destroy();
    res.render('authentication/login', {title: 'Log in'});
});

// POST
router.post('/register',session.middlewares.notAuth, (req, res, next) => {
    authService.register(req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/login');
        })
        .catch(error => {
            req.flash('errorMessages', error);
            res.redirect('/register');
        })
});

router.post('/login', session.middlewares.notAuth, (req, res, next) => {
    authService.login(req)
        .then(user => {
            if (!user.twoFaEnabled) {
                authService.logUser(req, user.email)
                    .then(() => {
                        res.redirect('/');
                    })
                return;
            }
            req.session.user = {
                id: user._id,
                email: user.email,
                phone: user.phone
            }
            twoFactor.sendLoginCode(req.session.user);
            res.render('authentication/two-factor', {
                title: 'Two-Factor Authentication',
                user: req.session.user,
            });
        })
        .catch(errors =>{
            req.flash('errorMessages', errors);
            res.redirect('/login');
        });
});

router.post('/login/two-factor/validate', session.middlewares.notAuth, (req, res) => {
    authService.loginWithTwoFactor(req)
        .then(() => {
            res.redirect('/');
        })
        .catch(error => {
            res.render('authentication/two-factor', {error: error});
        });
});

module.exports = router;
