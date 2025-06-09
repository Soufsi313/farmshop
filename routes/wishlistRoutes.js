const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const lusca = require('lusca');

const router = express.Router();

// Ajouter lusca.csrf() uniquement sur les routes non-GET
router.post('/add', lusca.csrf(), async (req, res) => {
    try {
        const { userId, productId } = req.body;
        await wishlistController.addToWishlist(userId, productId);
        res.status(201).send('Produit ajouté à la liste de souhaits.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.delete('/remove', lusca.csrf(), async (req, res) => {
    try {
        const { userId, productId } = req.body;
        await wishlistController.removeFromWishlist(userId, productId);
        res.status(200).send('Produit supprimé de la liste de souhaits.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir la liste de souhaits d'un utilisateur
router.get('/:userId', async (req, res) => {
    try {
        const wishlist = await wishlistController.getUserWishlist(req.params.userId);
        res.status(200).json(wishlist);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
