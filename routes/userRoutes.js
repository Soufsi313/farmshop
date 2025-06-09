const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Routes pour le modèle User
router.post('/subscribe-newsletter/:userId', async (req, res) => {
    try {
        await userController.subscribeToNewsletter(req.params.userId);
        res.status(200).send('Abonnement à la newsletter réussi.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/unsubscribe-newsletter/:userId', async (req, res) => {
    try {
        await userController.unsubscribeFromNewsletter(req.params.userId);
        res.status(200).send('Désabonnement de la newsletter réussi.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.delete('/soft-delete-account/:userId', async (req, res) => {
    try {
        await userController.softDeleteAccount(req.params.userId);
        res.status(200).send('Compte supprimé de manière douce.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/download-data/:userId', async (req, res) => {
    try {
        await userController.downloadUserData(req.params.userId);
        res.status(200).send('Téléchargement des données utilisateur réussi.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/contact-admin/:userId', async (req, res) => {
    try {
        await userController.contactAdmin(req.params.userId, req.body.message);
        res.status(200).send('Message envoyé à l’administrateur.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
