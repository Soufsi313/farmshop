const Location = require('../models/Location');
const Product = require('../models/Products');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

const locationController = {
    // Créer une location
    createLocation: async (userId, productId, quantity, startDate, endDate) => {
        try {
            const product = await Product.findByPk(productId);
            if (!product || !product.isAvailable) throw new Error('Produit non disponible à la location.');
            if (quantity > product.quantity) throw new Error('Quantité demandée supérieure au stock disponible.');
            // Créer la location
            const location = await Location.create({ userId, productId, quantity, startDate, endDate });
            // Mettre à jour le stock produit
            product.quantity -= quantity;
            await product.save();
            return location;
        } catch (error) {
            throw error;
        }
    },

    // Mettre à jour le statut de la location (automatisé, simulation CRON)
    updateLocationStatus: async (locationId, newStatus) => {
        try {
            const location = await Location.findByPk(locationId);
            if (!location) throw new Error('Location non trouvée.');
            location.status = newStatus;
            await location.save();
        } catch (error) {
            throw error;
        }
    },

    // Gérer le retour de stock après la fin de la location
    returnProduct: async (locationId) => {
        try {
            const location = await Location.findByPk(locationId);
            if (!location) throw new Error('Location non trouvée.');
            if (location.status !== 'finished' && location.status !== 'late') throw new Error('La location doit être terminée ou en retard pour retourner le produit.');
            const product = await Product.findByPk(location.productId);
            product.quantity += location.quantity;
            await product.save();
        } catch (error) {
            throw error;
        }
    },

    // Appliquer une pénalité en cas de retard
    applyPenalty: async (locationId, penaltyAmount) => {
        try {
            const location = await Location.findByPk(locationId);
            if (!location) throw new Error('Location non trouvée.');
            location.penalty = penaltyAmount;
            await location.save();
        } catch (error) {
            throw error;
        }
    },

    // Générer une facture PDF (simulation)
    generateInvoice: async (locationId) => {
        try {
            const location = await Location.findByPk(locationId);
            if (!location) throw new Error('Location non trouvée.');
            const invoicePath = path.join(__dirname, `../invoices/invoice_location_${locationId}.pdf`);
            fs.writeFileSync(invoicePath, `Facture pour la location ${locationId}`);
            location.invoiceUrl = invoicePath;
            await location.save();
            return invoicePath;
        } catch (error) {
            throw error;
        }
    },

    // Notifier l'utilisateur par email (simulation)
    notifyUserEndSoon: async (locationId, userEmail) => {
        try {
            // Simulation d'envoi d'email
            console.log(`Notification email envoyée à ${userEmail} : Votre location se termine dans une semaine.`);
        } catch (error) {
            throw error;
        }
    },

    // Voir les locations d'un utilisateur
    getUserLocations: async (userId) => {
        try {
            const locations = await Location.findAll({ where: { userId } });
            return locations;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = locationController;
