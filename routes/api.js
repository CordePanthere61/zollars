const express = require('express');
const router = express.Router();
const crypto = require('../utils/crypto');
const apiService = require('../services/apiService');

router.get('/market-values', (req, res) => {
    return crypto.getMarketValues().then(market => {
        return res.json(market);
    }).catch(error => {
        return res.json(error);
    });
});

router.post('/send/:symbol', (req, res) => {
    console.log(req.body)
    apiService.receiveCrypto(req)
        .then(status => {
            res.statusCode = status;
            res.send();
        })
        .catch(status => {
            res.statusCode = status;
            res.send();
        });
});

module.exports = router;