const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const lusca = require('lusca');
const auth = require('../middleware/auth');

const router = express.Router();

// Ajouter lusca.csrf() uniquement sur les routes non-GET
router.post('/add', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        // Only allow if user is self or admin
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        await wishlistController.addToWishlist(req.body.userId, req.body.productId);
        res.status(201).send('Produit ajouté à la liste de souhaits.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.delete('/remove', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        await wishlistController.removeFromWishlist(req.body.userId, req.body.productId);
        res.status(200).send('Produit supprimé de la liste de souhaits.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir la liste de souhaits d'un utilisateur
router.get('/:userId', auth.authenticateJWT, async (req, res) => {
    try {
        if (parseInt(req.params.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const wishlist = await wishlistController.getUserWishlist(req.params.userId);
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
