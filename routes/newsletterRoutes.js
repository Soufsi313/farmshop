const express = require('express');
const newsletterController = require('../controllers/newsletterController');
const lusca = require('lusca');
const auth = require('../middleware/auth');

const router = express.Router();

// S'abonner à la newsletter
router.post('/subscribe', lusca.csrf(), async (req, res) => {
    try {
        const { email, userId } = req.body;
        const result = await newsletterController.subscribe(email, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Se désabonner de la newsletter
router.post('/unsubscribe', lusca.csrf(), async (req, res) => {
    try {
        const { email } = req.body;
        await newsletterController.unsubscribe(email);
        res.status(200).send('Désabonnement réussi.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Récupérer tous les abonnés (admin)
router.get('/subscribers', auth.authenticateJWT, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Admin only.');
        }
        const subscribers = await newsletterController.getAllSubscribers();
        res.status(200).json(subscribers);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Envoyer une newsletter (simulation, admin)
router.post('/send', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Admin only.');
        }
        const { subject, content } = req.body;
        await newsletterController.sendNewsletter(subject, content);
        res.status(200).send('Newsletter envoyée à tous les abonnés.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
