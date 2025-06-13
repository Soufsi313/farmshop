const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartItemController');
const auth = require('../middleware/auth');
const lusca = require('lusca');
const csrf = lusca.csrf();

// Get all cart items for a cart (public)
router.get('/:cartId', cartItemController.getAll);

// Add, update, remove (protected: auth + CSRF)
router.post('/', auth.authenticateJWT, csrf, cartItemController.add);
router.put('/:id', auth.authenticateJWT, csrf, cartItemController.update);
router.delete('/:id', auth.authenticateJWT, csrf, cartItemController.remove);

module.exports = router;
