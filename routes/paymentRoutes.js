// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Créer un PaymentIntent Stripe (auth obligatoire)
router.post('/create-intent', authenticate, paymentController.createPaymentIntent);
// Créer une session Stripe Checkout (auth obligatoire)
router.post('/create-checkout-session', authenticate, paymentController.createCheckoutSession);

module.exports = router;
