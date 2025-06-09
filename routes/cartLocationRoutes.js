const express = require('express');
const cartLocationController = require('../controllers/cartLocationController');
const lusca = require('lusca');

const router = express.Router();

// Ajouter un produit à la location
router.post('/add', lusca.csrf(), async (req, res) => {
    try {
        const { userId, productId, quantity, duration } = req.body;
        await cartLocationController.addToCartLocation(userId, productId, quantity, duration);
        res.status(201).send('Produit ajouté au panier de location.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir le panier de location de l'utilisateur
router.get('/:userId', async (req, res) => {
    try {
        const cart = await cartLocationController.getUserCartLocation(req.params.userId);
        res.status(200).json(cart);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Modifier la quantité ou la durée de location d'un produit
router.put('/update', lusca.csrf(), async (req, res) => {
    try {
        const { userId, productId, newQuantity, newDuration } = req.body;
        await cartLocationController.updateCartLocation(userId, productId, newQuantity, newDuration);
        res.status(200).send('Panier de location mis à jour.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Supprimer un produit du panier de location
router.delete('/remove', lusca.csrf(), async (req, res) => {
    try {
        const { userId, productId } = req.body;
        await cartLocationController.removeFromCartLocation(userId, productId);
        res.status(200).send('Produit supprimé du panier de location.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Passer la commande de location
router.post('/checkout', lusca.csrf(), async (req, res) => {
    try {
        const { userId } = req.body;
        await cartLocationController.checkoutLocation(userId);
        res.status(200).send('Commande de location validée.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
