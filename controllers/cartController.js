const Cart = require('../models/Cart');
const Product = require('../models/Products');

const cartController = {
    // Ajouter un produit au panier
    addToCart: async (userId, productId, quantity) => {
        try {
            // Vérifier si le produit est déjà dans le panier de l'utilisateur
            const existing = await Cart.findOne({ where: { userId, productId, status: 'pending' } });
            if (existing) {
                throw new Error('Ce produit est déjà dans votre panier.');
            }
            // Vérifier la disponibilité du produit
            const product = await Product.findByPk(productId);
            if (!product || !product.isAvailable) {
                throw new Error('Produit non disponible.');
            }
            if (quantity > product.quantity) {
                throw new Error('Quantité demandée supérieure au stock disponible.');
            }
            // Ajouter au panier
            await Cart.create({ userId, productId, quantity });
        } catch (error) {
            throw error;
        }
    },

    // Voir le panier de l'utilisateur
    getUserCart: async (userId) => {
        try {
            const cart = await Cart.findAll({
                where: { userId, status: 'pending' },
                include: [{ model: Product }],
            });
            return cart;
        } catch (error) {
            throw error;
        }
    },

    // Passer la commande
    checkout: async (userId) => {
        try {
            const cartItems = await Cart.findAll({ where: { userId, status: 'pending' } });
            if (cartItems.length === 0) throw new Error('Votre panier est vide.');
            // Mettre à jour le stock produit et le statut du panier
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

    // Supprimer un produit du panier
    removeFromCart: async (userId, productId) => {
        try {
            await Cart.destroy({ where: { userId, productId, status: 'pending' } });
        } catch (error) {
            throw error;
        }
    },
};

module.exports = cartController;
