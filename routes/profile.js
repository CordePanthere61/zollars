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

router.post('/confirm-phone/validate', session.middlewares.auth, async (req, res) => {
    if (await profileService.validatePhoneConfirmation(req)) {
        req.flash('successMessages', profileService.successMessages);
    } else {
        req.flash('errorMessages', profileService.errorMessages);
    }
    res.redirect('/profile');
});

router.post('/two-factor/update', session.middlewares.auth, async (req, res) => {
    await profileService.updateTwoFactor(req);
    req.flash('successMessages', profileService.successMessages);
    res.redirect('/profile');
})

router.post('/change-password', async (req, res) => {
    if (await profileService.changePassword(req)) {
        req.flash('successMessages', profileService.successMessages);
    } else {
        req.flash('errorMessages', profileService.errorMessages);
    }
    res.redirect('/profile');
});

router.post('/add-card', async (req, res) => {
    if (await profileService.addCard(req)) {
        req.flash('successMessages', profileService.successMessages);
    } else {
        req.flash('errorMessages', profileService.errorMessages);
    }
    res.redirect('/profile');
});

router.post('/remove-card', async (req, res) => {
    await profileService.removeCard(req);
    req.flash('successMessages', profileService.successMessages);
    res.redirect('/profile');
});

module.exports = router