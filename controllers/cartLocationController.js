const CartLocation = require('../models/CartLocation');
const Product = require('../models/Products');

const cartLocationController = {
    // Ajouter un produit à la location
    addToCartLocation: async (userId, productId, quantity, duration) => {
        try {
            // Vérifier si le produit est déjà dans le panier de location de l'utilisateur
            const existing = await CartLocation.findOne({ where: { userId, productId, status: 'pending' } });
            if (existing) {
                throw new Error('Ce produit est déjà dans votre panier de location.');
            }
            // Vérifier la disponibilité du produit
            const product = await Product.findByPk(productId);
            if (!product || !product.isAvailable) {
                throw new Error('Produit non disponible.');
            }
            if (quantity > product.quantity) {
                throw new Error('Quantité demandée supérieure au stock disponible.');
            }
            // Ajouter au panier de location
            await CartLocation.create({ userId, productId, quantity, duration });
        } catch (error) {
            throw error;
        }
    },

    // Voir le panier de location de l'utilisateur
    getUserCartLocation: async (userId) => {
        try {
            const cart = await CartLocation.findAll({
                where: { userId, status: 'pending' },
                include: [{ model: Product }],
            });
            return cart;
        } catch (error) {
            throw error;
        }
    },

    // Modifier la quantité ou la durée de location d'un produit
    updateCartLocation: async (userId, productId, newQuantity, newDuration) => {
        try {
            const cartItem = await CartLocation.findOne({ where: { userId, productId, status: 'pending' } });
            if (!cartItem) throw new Error('Produit non trouvé dans le panier de location.');
            if (newQuantity !== undefined) cartItem.quantity = newQuantity;
            if (newDuration !== undefined) cartItem.duration = newDuration;
            await cartItem.save();
        } catch (error) {
            throw error;
        }
    },

    // Supprimer un produit du panier de location
    removeFromCartLocation: async (userId, productId) => {
        try {
            await CartLocation.destroy({ where: { userId, productId, status: 'pending' } });
        } catch (error) {
            throw error;
        }
    },

    // Passer la commande de location
    checkoutLocation: async (userId) => {
        try {
            const cartItems = await CartLocation.findAll({ where: { userId, status: 'pending' } });
            if (cartItems.length === 0) throw new Error('Votre panier de location est vide.');
            for (const item of cartItems) {
                const product = await Product.findByPk(item.productId);
                if (product.quantity < item.quantity) {
                    throw new Error(`Stock insuffisant pour le produit : ${product.name}`);
                }
                product.quantity -= item.quantity;
                await product.save();
                item.status = 'ordered';
                await item.save();
            }
        } catch (error) {
            throw error;
        }
    },
};

module.exports = cartLocationController;
