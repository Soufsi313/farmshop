const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');
const auth = require('../middleware/auth');
const lusca = require('lusca');

// Créer une commande à partir du panier (POST)
router.post('/', auth.authenticateJWT, lusca.csrf(), orderItemController.createOrderFromCart);

// Récupérer les commandes d'un utilisateur (GET, public pour test, à protéger si besoin)
router.get('/', auth.authenticateJWT, orderItemController.getUserOrders);

module.exports = router;
