// routes/stripeWebhookRoutes.js
const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripeWebhookController');

// Stripe webhook (pas d'auth ni CSRF !)
router.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhookController.handleStripeWebhook);

module.exports = router;
