const express = require('express');
const router = express.Router();
const specialOfferController = require('../controllers/specialOfferController');
const auth = require('../middleware/auth');
const lusca = require('lusca');

// Récupérer toutes les offres actives (public)
router.get('/active', specialOfferController.getActiveOffers);

// Récupérer toutes les offres (admin)
router.get('/all', auth.authenticateJWT, auth.requireAdmin, specialOfferController.getAllOffers);

// CRUD admin uniquement
router.post('/', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), specialOfferController.createOffer);
router.put('/:id', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), specialOfferController.updateOffer);
router.delete('/:id', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), specialOfferController.deleteOffer);

// Suppression des offres expirées (admin, peut être appelé par cron ou manuellement)
router.delete('/expired/all', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), specialOfferController.removeExpiredOffers);

module.exports = router;
