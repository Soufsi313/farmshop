const express = require('express');
const router = express.Router();
const cartItemLocationController = require('../controllers/cartItemLocationController');
const auth = require('../middleware/auth');
const csrf = require('../middleware/securityMiddleware');

// Get all cart location items for a cartLocation (public)
router.get('/:cartLocationId', cartItemLocationController.getAll);

// Add, update, remove (protected: auth + CSRF)
router.post('/', auth, csrf, cartItemLocationController.add);
router.put('/:id', auth, csrf, cartItemLocationController.update);
router.delete('/:id', auth, csrf, cartItemLocationController.remove);

module.exports = router;
