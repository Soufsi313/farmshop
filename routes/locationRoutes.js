const express = require('express');
const locationController = require('../controllers/locationController');
const lusca = require('lusca');

const router = express.Router();

// Créer une location
router.post('/create', lusca.csrf(), async (req, res) => {
    try {
        const { userId, productId, quantity, startDate, endDate } = req.body;
        const location = await locationController.createLocation(userId, productId, quantity, startDate, endDate);
        res.status(201).json(location);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Mettre à jour le statut de la location (admin ou CRON)
router.put('/status/:locationId', lusca.csrf(), async (req, res) => {
    try {
        const { newStatus } = req.body;
        await locationController.updateLocationStatus(req.params.locationId, newStatus);
        res.status(200).send('Location status updated.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Retourner le produit après la location
router.post('/return', lusca.csrf(), async (req, res) => {
    try {
        const { locationId } = req.body;
        await locationController.returnProduct(locationId);
        res.status(200).send('Product returned and stock updated.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Appliquer une pénalité en cas de retard
router.post('/penalty', lusca.csrf(), async (req, res) => {
    try {
        const { locationId, penaltyAmount } = req.body;
        await locationController.applyPenalty(locationId, penaltyAmount);
        res.status(200).send('Penalty applied.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Générer une facture PDF
router.get('/invoice/:locationId', async (req, res) => {
    try {
        const invoicePath = await locationController.generateInvoice(req.params.locationId);
        res.download(invoicePath);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Notifier l'utilisateur par email (simulation)
router.post('/notify', lusca.csrf(), async (req, res) => {
    try {
        const { locationId, userEmail } = req.body;
        await locationController.notifyUserEndSoon(locationId, userEmail);
        res.status(200).send('Notification sent.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir les locations d'un utilisateur
router.get('/user/:userId', async (req, res) => {
    try {
        const locations = await locationController.getUserLocations(req.params.userId);
        res.status(200).json(locations);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
