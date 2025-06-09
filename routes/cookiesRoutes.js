const express = require('express');
const cookiesController = require('../controllers/cookiesController');
const lusca = require('lusca');

const router = express.Router();

// Accepter les cookies
router.post('/accept', lusca.csrf(), async (req, res) => {
    try {
        const { userId } = req.body;
        const cookies = await cookiesController.acceptCookies(userId);
        res.status(200).json(cookies);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Refuser les cookies
router.post('/refuse', lusca.csrf(), async (req, res) => {
    try {
        const { userId } = req.body;
        const cookies = await cookiesController.refuseCookies(userId);
        res.status(200).json(cookies);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir l'état des cookies d'un utilisateur
router.get('/:userId', async (req, res) => {
    try {
        const cookies = await cookiesController.getCookiesStatus(req.params.userId);
        res.status(200).json(cookies);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
