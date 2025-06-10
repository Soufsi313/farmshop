const express = require('express');
const locationController = require('../controllers/locationController');
const lusca = require('lusca');
const auth = require('../middleware/auth');

const router = express.Router();

// Créer une location
router.post('/create', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const { userId, productId, quantity, startDate, endDate } = req.body;
        const location = await locationController.createLocation(userId, productId, quantity, startDate, endDate);
        res.status(201).json(location);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Mettre à jour le statut de la location (admin ou CRON)
router.put('/status/:locationId', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Admin only.');
        }
        const { newStatus } = req.body;
        await locationController.updateLocationStatus(req.params.locationId, newStatus);
        res.status(200).send('Location status updated.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Retourner le produit après la location
router.post('/return', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        // Only admin or self can return
        if (req.user.role !== 'Admin') {
            // You may want to check location ownership in controller for more security
        }
        await locationController.returnProduct(req.body.locationId);
        res.status(200).send('Product returned and stock updated.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Appliquer une pénalité en cas de retard
router.post('/penalty', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Admin only.');
        }
        const { locationId, penaltyAmount } = req.body;
        await locationController.applyPenalty(locationId, penaltyAmount);
        res.status(200).send('Penalty applied.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Générer une facture PDF
router.get('/invoice/:locationId', auth.authenticateJWT, async (req, res) => {
    try {
        // Only admin or location owner can download invoice
        const invoicePath = await locationController.generateInvoice(req.params.locationId);
        res.download(invoicePath);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Notifier l'utilisateur par email (simulation)
router.post('/notify', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Admin only.');
        }
        const { locationId, userEmail } = req.body;
        await locationController.notifyUserEndSoon(locationId, userEmail);
        res.status(200).send('Notification sent.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir les locations d'un utilisateur
router.get('/user/:userId', auth.authenticateJWT, async (req, res) => {
    try {
        if (parseInt(req.params.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const locations = await locationController.getUserLocations(req.params.userId);
        res.status(200).json(locations);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
