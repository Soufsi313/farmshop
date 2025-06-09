const Wishlist = require('../models/Wishlist');
const Product = require('../models/Products');

const wishlistController = {
    // Ajouter un produit à la liste de souhaits
    addToWishlist: async (userId, productId) => {
        try {
            const existing = await Wishlist.findOne({ where: { userId, productId } });
            if (existing) {
                throw new Error('Ce produit est déjà dans votre liste de souhaits.');
            }
            await Wishlist.create({ userId, productId });
        } catch (error) {
            throw error;
        }
    },

    // Supprimer un produit de la liste de souhaits
    removeFromWishlist: async (userId, productId) => {
        try {
            await Wishlist.destroy({ where: { userId, productId } });
        } catch (error) {
            throw error;
        }
    },

    // Voir la liste de souhaits d'un utilisateur
    getUserWishlist: async (userId) => {
        try {
            const wishlist = await Wishlist.findAll({
                where: { userId },
                include: [{ model: Product }],
            });
            return wishlist;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = wishlistController;
