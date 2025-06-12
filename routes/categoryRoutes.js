const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const lusca = require('lusca');

// Get all categories (public)
router.get('/', categoryController.getAllCategories);

// Protect all other routes (admin only + CSRF)
router.post('/', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), categoryController.createCategory);
router.put('/:id', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), categoryController.updateCategory);
router.delete('/:id', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), categoryController.deleteCategory);

module.exports = router;
