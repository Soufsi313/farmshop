const express = require('express');
const ordersController = require('../controllers/ordersController');
const lusca = require('lusca');

const router = express.Router();

// Créer une commande
router.post('/create', lusca.csrf(), async (req, res) => {
    try {
        const { userId, ...orderData } = req.body;
        const order = await ordersController.createOrder(userId, orderData);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Mettre à jour le statut de la commande (admin ou CRON)
router.put('/status/:orderId', lusca.csrf(), async (req, res) => {
    try {
        const { newStatus } = req.body;
        await ordersController.updateOrderStatus(req.params.orderId, newStatus);
        res.status(200).send('Order status updated.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Annuler une commande
router.post('/cancel', lusca.csrf(), async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        await ordersController.cancelOrder(orderId, userId);
        res.status(200).send('Order cancelled and refunded if eligible.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Télécharger la facture PDF
router.get('/invoice/:orderId', async (req, res) => {
    try {
        const invoicePath = await ordersController.downloadInvoice(req.params.orderId);
        res.download(invoicePath);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Retour produit
router.post('/return', lusca.csrf(), async (req, res) => {
    try {
        const { orderId, userId } = req.body;
        await ordersController.returnOrder(orderId, userId);
        res.status(200).send('Order returned and refunded if eligible.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir les commandes d'un utilisateur
router.get('/user/:userId', async (req, res) => {
    try {
        const orders = await ordersController.getUserOrders(req.params.userId);
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
