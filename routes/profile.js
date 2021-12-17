const express = require('express');
const router = express.Router();
const profileService = require('../services/profileService');
const session = require('../utils/session');
const twoFactor = require('../utils/twoFactor');

router.post('/confirm-phone', session.middlewares.auth, (req, res, next) => {
    if (!req.session.user.phoneConfirmed) {
        twoFactor.sendPhoneConfirmation(req.session.user);
        res.render('app/confirm-phone');
        return;
    }
    req.flash('errorMessages', 'Phone already confirmed.');
    res.redirect('/profile');
});

router.post('/confirm-phone/validate', session.middlewares.auth, (req, res) => {
    profileService.validatePhoneConfirmation(req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/profile');
        })
        .catch(error => {
            req.flash('errorMessages', error);
            res.redirect('/profile');
        });
});

router.post('/two-factor/update', session.middlewares.auth, (req, res) => {
    profileService.updateTwoFactor(req)
        .then(msg => {
            req.flash('successMessages', msg);
            res.redirect('/profile');
        });
});

router.post('/change-password', (req, res) => {
    profileService.changePassword(req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/profile');
        })
        .catch(error => {
            req.flash('errorMessages', error);
            res.redirect('/profile');
        });
});

router.post('/add-card',  (req, res) => {
    profileService.addCard(req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/profile');
        })
        .catch(error => {
            req.flash('errorMessages', error);
            res.redirect('/profile');
        });
});

router.post('/remove-card', (req, res) => {
    profileService.removeCard(req)
        .then(success => {
            req.flash('successMessages', success);
            res.redirect('/profile');
        })
        .catch(error => {
            req.flash('errorMessages', error);
            res.redirect('/profile');
        });
});

module.exports = router