const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

// Annulation de commande
router.patch('/:id/cancel', authenticate, orderController.cancelOrder);
// Retour de commande
router.patch('/:id/return', authenticate, orderController.returnOrder);

module.exports = router;
