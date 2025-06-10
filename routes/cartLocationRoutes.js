const express = require('express');
const cartLocationController = require('../controllers/cartLocationController');
const lusca = require('lusca');
const auth = require('../middleware/auth');

const router = express.Router();

// Ajouter un produit à la location
router.post('/add', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const { userId, productId, quantity, duration } = req.body;
        await cartLocationController.addToCartLocation(userId, productId, quantity, duration);
        res.status(201).send('Produit ajouté au panier de location.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir le panier de location de l'utilisateur
router.get('/:userId', auth.authenticateJWT, async (req, res) => {
    try {
        if (parseInt(req.params.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const cart = await cartLocationController.getUserCartLocation(req.params.userId);
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Modifier la quantité ou la durée de location d'un produit
router.put('/update', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const { userId, productId, newQuantity, newDuration } = req.body;
        await cartLocationController.updateCartLocation(userId, productId, newQuantity, newDuration);
        res.status(200).send('Panier de location mis à jour.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Supprimer un produit du panier de location
router.delete('/remove', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        await cartLocationController.removeFromCartLocation(req.body.userId, req.body.productId);
        res.status(200).send('Produit supprimé du panier de location.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Passer la commande de location
router.post('/checkout', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        await cartLocationController.checkoutLocation(req.body.userId);
        res.status(200).send('Commande de location validée.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
