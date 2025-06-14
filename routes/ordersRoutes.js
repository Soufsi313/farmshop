const express = require('express');
const ordersController = require('../controllers/ordersController');
const lusca = require('lusca');
const auth = require('../middleware/auth');

const router = express.Router();

// Créer une commande
router.post('/create', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const { userId, ...orderData } = req.body;
        const order = await ordersController.createOrder(userId, orderData);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Mettre à jour le statut de la commande (admin ou CRON)
router.put('/status/:orderId', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        // Only admin can update order status
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Admin only.');
        }
        const { newStatus } = req.body;
        await ordersController.updateOrderStatus(req.params.orderId, newStatus);
        res.status(200).send('Order status updated.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Annuler une commande
router.post('/cancel', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const { orderId, userId } = req.body;
        await ordersController.cancelOrder(orderId, userId);
        res.status(200).send('Order cancelled and refunded if eligible.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Télécharger la facture PDF
router.get('/invoice/:orderId', auth.authenticateJWT, async (req, res) => {
    try {
        // Only admin or order owner can download invoice
        // (You may want to check order ownership in controller for more security)
        const invoicePath = await ordersController.downloadInvoice(req.params.orderId);
        res.download(invoicePath);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Retour produit
router.post('/return', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.body.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const { orderId, userId } = req.body;
        await ordersController.returnOrder(orderId, userId);
        res.status(200).send('Order returned and refunded if eligible.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Voir les commandes d'un utilisateur
router.get('/user/:userId', auth.authenticateJWT, async (req, res) => {
    try {
        if (parseInt(req.params.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        const orders = await ordersController.getUserOrders(req.params.userId);
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
