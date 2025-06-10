const express = require('express');
const cookiesController = require('../controllers/cookiesController');
const lusca = require('lusca');
const auth = require('../middleware/auth');

const router = express.Router();

// Accepter les cookies
router.post('/accept', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const cookies = await cookiesController.acceptCookies(req.body.userId);
        res.status(200).json(cookies);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Refuser les cookies
router.post('/refuse', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const cookies = await cookiesController.refuseCookies(req.body.userId);
        res.status(200).json(cookies);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir l'état des cookies d'un utilisateur
router.get('/:userId', auth.authenticateJWT, async (req, res) => {
    try {
        if (parseInt(req.params.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const cookies = await cookiesController.getCookiesStatus(req.params.userId);
        res.status(200).json(cookies);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
