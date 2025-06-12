const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

// Get all categories (public)
router.get('/', categoryController.getAllCategories);

// Create category (admin only)
router.post('/', auth.authenticateJWT, auth.requireAdmin, categoryController.createCategory);

// Update category (admin only)
router.put('/:id', auth.authenticateJWT, auth.requireAdmin, categoryController.updateCategory);

// Delete category (admin only)
router.delete('/:id', auth.authenticateJWT, auth.requireAdmin, categoryController.deleteCategory);

module.exports = router;
