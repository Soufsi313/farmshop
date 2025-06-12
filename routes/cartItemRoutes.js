const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartItemController');
const auth = require('../middleware/auth');
const csrf = require('../middleware/securityMiddleware');

// Get all cart items for a cart (public)
router.get('/:cartId', cartItemController.getAll);

// Add, update, remove (protected: auth + CSRF)
router.post('/', auth, csrf, cartItemController.add);
router.put('/:id', auth, csrf, cartItemController.update);
router.delete('/:id', auth, csrf, cartItemController.remove);

module.exports = router;
