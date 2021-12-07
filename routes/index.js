const express = require('express');
const router = express.Router();
const authService = require('../services/authenticationService')
const {User, getUserWallets, getUserCard} = require("../models/User");
const session = require('../utils/session')
const twoFactor = require("../utils/twoFactor");

// GET

router.get('/', session.middlewares.auth ,(req, res, next) => {
    res.render('app/dashboard', {title: 'Dashboard'});
});

router.get('/wallets', session.middlewares.auth , async (req, res, next) => {
    const queryWallet = await getUserWallets(req.session.user.email);
    const queryCard = await getUserCard(req.session.user.email);
    console.log(queryWallet.wallets);
    res.render('app/wallets', {title: 'Wallets', wallets: queryWallet.wallets, card: queryCard.card});
});

router.get('/transaction-history', session.middlewares.auth ,(req, res, next) => {
    res.render('app/transaction-history', {title: 'Transaction history'});
});

router.get('/profile', session.middlewares.auth , async (req, res, next) => {
    const queryResult = await getUserCard(req.session.user.email);
    res.render('app/profile', {title: 'Profile', card: queryResult.card});
});

router.get('/register', session.middlewares.notAuth, (req, res, next) => {
    res.render('authentication/register', {title: 'Register'});
});

router.get('/logout', session.middlewares.auth, (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
});

router.get('/login', session.middlewares.notAuth ,async (req, res, next) => {
    console.log(await User.find({}));
    req.session.destroy();
    res.render('authentication/login', {title: 'Log in'});
});

// POST

router.post('/register',session.middlewares.notAuth, async (req, res, next) => {
    const newUser = await authService.register(req);
    if (newUser) {
        req.flash('successMessages', authService.successMessages);
        res.redirect('/login');
        return;
    }
    req.flash('errorMessages', authService.errorMessages)
    res.redirect('/register');
});

router.post('/login', session.middlewares.notAuth, async (req, res, next) => {
    const user = await authService.login(req);
    if (user) {
        if (!user.twoFaEnabled) {
            await authService.logUser(req, user.email);
            res.redirect('/');
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
        return;
    }
    req.flash('errorMessages', authService.errorMessages);
    res.redirect('/login');
});

router.post('/login/two-factor/validate', session.middlewares.notAuth, async (req, res) => {
    if (await authService.loginWithTwoFactor(req)) {
        res.redirect('/');
        return;
    }
    res.render('authentication/two-factor', {errorMessages: 'Invalid code.'});
});

module.exports = router;
