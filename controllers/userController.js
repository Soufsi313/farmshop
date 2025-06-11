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

    // Récupérer tous les utilisateurs actifs (non supprimés)
    getAllActiveUsers: async (page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        const { count, rows } = await User.findAndCountAll({
            where: {
                deletedAt: null
            },
            order: [['createdAt', 'DESC']],
            offset,
            limit
        });
        return { users: rows, total: count };
    },

    // Suppression d'un utilisateur (admin only, pas d'auto-suppression, impossible de supprimer un admin)
    deleteUser: async (adminId, userId) => {
        if (parseInt(adminId) === parseInt(userId)) {
            throw new Error('Vous ne pouvez pas vous auto-supprimer.');
        }
        const user = await User.findByPk(userId);
        if (!user) throw new Error('Utilisateur non trouvé');
        if (user.role === 'Admin') {
            throw new Error('Impossible de supprimer un administrateur. Rétrogradez-le en User d’abord.');
        }
        await user.destroy();
        return true;
    },

    // Modification du rôle d'un utilisateur (admin only, pas pour soi-même)
    updateUserRole: async (adminId, userId, newRole) => {
        if (parseInt(adminId) === parseInt(userId)) {
            throw new Error('Vous ne pouvez pas modifier votre propre rôle.');
        }
        const user = await User.findByPk(userId);
        if (!user) throw new Error('Utilisateur non trouvé');
        if (!['Admin', 'User'].includes(newRole)) {
            throw new Error('Rôle invalide.');
        }
        user.role = newRole;
        await user.save();
        return user;
    },

    // Mettre à jour la bio
    updateBio: async (req, res) => {
        try {
            const { id } = req.params;
            const { bio } = req.body;
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            user.bio = bio;
            await user.save();
            res.json({ message: 'Bio mise à jour', bio: user.bio });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Mettre à jour la photo de profil
    updateProfilePicture: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            if (!req.file) return res.status(400).json({ message: 'Aucun fichier envoyé.' });
            // Stocke le chemin relatif pour le frontend
            user.profilePicture = '/uploads/' + req.file.filename;
            await user.save();
            res.json({ message: 'Photo de profil mise à jour', profilePicture: user.profilePicture });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Envoyer un message dans la boîte de réception (support des fils de discussion et pièces jointes)
    sendMessageToInbox: async (req, res) => {
        try {
            const { id } = req.params; // destinataire
            const { from, subject, body, threadId, documents } = req.body;
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            let inbox = Array.isArray(user.inbox) ? user.inbox : [];
            let newThreadId = threadId || (Date.now() + '-' + Math.random().toString(36).substr(2, 9));
            const message = {
                from,
                subject,
                body,
                date: new Date(),
                lu: false,
                threadId: newThreadId,
                documents: Array.isArray(documents) ? documents : [] // Pièces jointes (ex: [{name, url}])
            };
            inbox.push(message);
            user.inbox = inbox;
            await user.save();
            res.json({ message: 'Message envoyé', threadId: newThreadId, inbox: user.inbox });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Récupérer les fils de discussion (threads) de la boîte de réception
    getInboxThreads: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            const inbox = Array.isArray(user.inbox) ? user.inbox : [];
            // Regrouper les messages par threadId
            const threads = {};
            inbox.forEach(msg => {
                if (!threads[msg.threadId]) threads[msg.threadId] = [];
                threads[msg.threadId].push(msg);
            });
            res.json({ threads });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Lire la boîte de réception
    getInbox: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            res.json({ inbox: user.inbox || [] });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Supprimer un message de la boîte de réception (par index)
    deleteInboxMessage: async (req, res) => {
        try {
            const { id, msgIndex } = req.params;
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            if (!Array.isArray(user.inbox) || user.inbox.length <= msgIndex) {
                return res.status(404).json({ message: 'Message non trouvé' });
            }
            user.inbox.splice(msgIndex, 1);
            await user.save();
            res.json({ message: 'Message supprimé', inbox: user.inbox });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Récupérer les infos d'un utilisateur par son id
    getUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);
            if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
            // On ne renvoie pas le mot de passe
            const { password, ...userData } = user.toJSON();
            res.json({ user: userData });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },
};

module.exports = userController;
