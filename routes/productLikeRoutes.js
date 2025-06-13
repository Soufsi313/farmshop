const express = require('express');
const router = express.Router();
const productLikeController = require('../controllers/productLikeController');
const auth = require('../middleware/auth');
const csrf = require('../middleware/securityMiddleware');

// Like
router.post('/like', auth, csrf, productLikeController.like);
// Unlike
router.post('/unlike', auth, csrf, productLikeController.unlike);
// Compter les likes d'un produit
router.get('/count/:productId', productLikeController.count);
// Vérifier si un utilisateur a liké
router.get('/is-liked', auth, productLikeController.isLiked);

module.exports = router;
