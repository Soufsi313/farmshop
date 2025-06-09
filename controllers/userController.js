const User = require('../models/Users');

const userController = {
    subscribeToNewsletter: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Utilisateur non trouvé');

            user.isSubscribedToNewsletter = true;
            await user.save();
            console.log(`L'utilisateur ${user.username} s'est abonné à la newsletter.`);
        } catch (error) {
            console.error('Erreur lors de l\'abonnement à la newsletter :', error);
        }
    },

    unsubscribeFromNewsletter: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Utilisateur non trouvé');

            user.isSubscribedToNewsletter = false;
            await user.save();
            console.log(`L'utilisateur ${user.username} s'est désabonné de la newsletter.`);
        } catch (error) {
            console.error('Erreur lors du désabonnement à la newsletter :', error);
        }
    },

    softDeleteAccount: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Utilisateur non trouvé');

            user.isSoftDeleted = true;
            await user.destroy();
            console.log(`Le compte de l'utilisateur ${user.username} a été supprimé de manière douce.`);
        } catch (error) {
            console.error('Erreur lors de la suppression douce du compte :', error);
        }
    },

    downloadUserData: async (userId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Utilisateur non trouvé');

            user.downloadData();
        } catch (error) {
            console.error('Erreur lors du téléchargement des données utilisateur :', error);
        }
    },

    contactAdmin: async (userId, message) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('Utilisateur non trouvé');

            console.log(`L'utilisateur ${user.username} a envoyé un message à l'administrateur : ${message}`);
        } catch (error) {
            console.error('Erreur lors du contact avec l\'administrateur :', error);
        }
    },

    // Product CRUD operations
    createProduct: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas créer de produits.');
    },

    updateProduct: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas mettre à jour les produits.');
    },

    deleteProduct: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas supprimer les produits.');
    },

    // Blog Post CRUD operations
    createBlogPost: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas créer des articles de blog.');
    },

    updateBlogPost: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas mettre à jour les articles de blog.');
    },

    deleteBlogPost: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas supprimer les articles de blog.');
    },

    // Category CRUD operations
    createCategory: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas créer des catégories.');
    },

    updateCategory: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas mettre à jour les catégories.');
    },

    deleteCategory: async () => {
        throw new Error('Permission refusée : Les utilisateurs ne peuvent pas supprimer les catégories.');
    },
};

module.exports = userController;
