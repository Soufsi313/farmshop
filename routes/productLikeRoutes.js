const express = require('express');
const router = express.Router();
const productLikeController = require('../controllers/productLikeController');
const { authenticateJWT } = require('../middleware/auth');

// Like
router.post('/like', authenticateJWT, productLikeController.like);
// Unlike
router.post('/unlike', authenticateJWT, productLikeController.unlike);
// Compter les likes d'un produit
router.get('/count/:productId', productLikeController.count);
// Vérifier si un utilisateur a liké
router.get('/is-liked', authenticateJWT, productLikeController.isLiked);

module.exports = router;
