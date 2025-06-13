const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');
const lusca = require('lusca');

// Récupérer le panier en cours de l'utilisateur connecté
router.get('/user', auth.authenticateJWT, async (req, res) => {
  try {
    console.log('API /api/cart/user - user:', req.user);
    const cart = await cartController.getOrCreateUserCart(req.user.id);
    res.json(cart);
  } catch (err) {
    console.error('Erreur API /api/cart/user:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// (Optionnel) Créer un panier explicitement
router.post('/user', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
  try {
    const cart = await cartController.getOrCreateUserCart(req.user.id, true);
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
