const Orders = require('../models/Orders');
const Product = require('../models/Products');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const ordersController = {
    // Créer une commande
    createOrder: async (userId, orderData) => {
        try {
            const order = await Orders.create({ ...orderData, userId });
            return order;
        } catch (error) {
            throw error;
        }
    },

    // Mettre à jour le statut de la commande (simulation CRON)
    updateOrderStatus: async (orderId, newStatus) => {
        try {
            const order = await Orders.findByPk(orderId);
            if (!order) throw new Error('Commande non trouvée.');
            order.status = newStatus;
            if (newStatus === 'delivered') {
                order.deliveredDate = new Date();
            }
            await order.save();
            // Simuler l'envoi d'une notification email
            console.log(`Notification email: Statut de la commande ${orderId} mis à jour à ${newStatus}`);
        } catch (error) {
            throw error;
        }
    },

    // Annuler une commande (avant expédition)
    cancelOrder: async (orderId, userId) => {
        try {
            const order = await Orders.findOne({ where: { id: orderId, userId } });
            if (!order) throw new Error('Commande non trouvée.');
            if (['shipped', 'delivered'].includes(order.status)) {
                throw new Error('Impossible d’annuler une commande déjà expédiée ou livrée.');
            }
            order.status = 'cancelled';
            order.isRefunded = true;
            await order.save();
            // Simuler remboursement automatique
            console.log(`Remboursement automatique pour la commande ${orderId}`);
        } catch (error) {
            throw error;
        }
    },

    // Télécharger la facture PDF (simulation)
    downloadInvoice: async (orderId) => {
        try {
            const order = await Orders.findByPk(orderId);
            if (!order) throw new Error('Commande non trouvée.');
            // Simuler la génération d'une facture PDF
            const invoicePath = path.join(__dirname, `../invoices/invoice_${orderId}.pdf`);
            fs.writeFileSync(invoicePath, `Facture pour la commande ${orderId}`);
            order.invoiceUrl = invoicePath;
            await order.save();
            return invoicePath;
        } catch (error) {
            throw error;
        }
    },

    // Gérer le retour produit (droit de rétractation)
    returnOrder: async (orderId, userId) => {
        try {
            const order = await Orders.findOne({ where: { id: orderId, userId } });
            if (!order) throw new Error('Commande non trouvée.');
            if (order.status !== 'delivered') {
                throw new Error('Seules les commandes livrées peuvent être retournées.');
            }
            // Vérifier le délai de rétractation (14 jours)
            const now = new Date();
            const deliveredDate = new Date(order.deliveredDate);
            const diffDays = Math.floor((now - deliveredDate) / (1000 * 60 * 60 * 24));
            if (!order.isPerishable && diffDays > 14) {
                throw new Error('Le délai de rétractation de 14 jours est dépassé.');
            }
            order.status = 'returned';
            order.isRefunded = true;
            await order.save();
            // Simuler remboursement automatique
            console.log(`Remboursement automatique pour la commande retournée ${orderId}`);
        } catch (error) {
            throw error;
        }
    },

    // Voir les commandes d'un utilisateur
    getUserOrders: async (userId) => {
        try {
            const orders = await Orders.findAll({ where: { userId } });
            return orders;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = ordersController;
