const User = require('../models/Users');
const Messages = require('../models/Messages');
const nodemailer = require('nodemailer');
require('dotenv').config();

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

            // Envoi de l'email de confirmation de suppression
            let emailSent = false;
            let emailError = null;
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASS,
                    },
                });
                const emailHtml = `
                    <div style="background:#f8fff5;padding:32px 0;font-family:'Segoe UI',Arial,sans-serif;">
                      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(25,135,84,0.08);padding:32px 24px;">
                        <div style="text-align:center;margin-bottom:24px;">
                          <span style="display:inline-block;background:#198754;color:#fff;font-size:2rem;font-weight:bold;padding:8px 24px;border-radius:8px;letter-spacing:2px;">FarmShop</span>
                        </div>
                        <h2 style="color:#d32f2f;text-align:center;margin-bottom:16px;">Suppression de votre compte</h2>
                        <p style="font-size:1.1rem;color:#222;text-align:center;margin-bottom:24px;">
                          Bonjour ${user.username || user.email},<br>
                          Votre compte FarmShop a bien été supprimé (suppression douce).<br>
                          Si ce n'était pas vous, contactez immédiatement le support.<br>
                          Vous pouvez télécharger vos données depuis votre profil avant suppression définitive.
                        </p>
                        <hr style="margin:32px 0 16px 0;border:none;border-top:1px solid #e6f4e6;">
                        <div style="text-align:center;font-size:0.95rem;color:#888;">
                          © 2024-2025 FarmShop. Tous droits réservés.<br>
                        </div>
                      </div>
                    </div>`;
                await transporter.sendMail({
                    from: `FarmShop <${process.env.GMAIL_USER}>`,
                    to: user.email,
                    subject: 'Confirmation de suppression de votre compte - FarmShop',
                    html: emailHtml
                });
                emailSent = true;
            } catch (mailErr) {
                emailError = mailErr.message || mailErr;
                console.error('Erreur lors de l’envoi de l’email de suppression:', emailError);
            }
            return { emailSent, emailError };
        } catch (error) {
            console.error('Erreur lors de la suppression douce du compte :', error);
            throw error;
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
            // On suppose que l'admin a l'id 3 (à adapter si besoin)
            const adminId = 3;
            const admin = await User.findByPk(adminId);
            const user = await User.findByPk(userId);
            if (!admin || !user) throw new Error('Utilisateur ou admin non trouvé');

            // Crée le message à ajouter dans l'inbox de l'admin
            const msg = {
                from: user.username || user.email || 'Visiteur',
                fromId: user.id,
                subject: 'Contact utilisateur',
                body: message,
                date: new Date(),
                lu: false,
                threadId: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                documents: [],
                traite: false
            };
            let inbox = Array.isArray(admin.inbox) ? admin.inbox : [];
            inbox.push(msg);
            admin.inbox = inbox;
            await admin.save();
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

    // Récupérer tous les utilisateurs (actifs + supprimés) pour l'admin
    getAllUsers: async (page = 1, limit = 10) => {
        const offset = (page - 1) * limit;
        const { count, rows } = await User.findAndCountAll({
            paranoid: false, // Inclut les soft-deleted
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

    // Envoyer un message (création)
    sendMessage: async (req, res) => {
        try {
            const { id } = req.params; // destinataire (toId)
            const { fromId, subject, body, threadId, documents } = req.body;
            const toUser = await User.findByPk(id);
            if (!toUser) return res.status(404).json({ message: 'Destinataire non trouvé' });
            const newThreadId = threadId || (Date.now() + '-' + Math.random().toString(36).substr(2, 9));
            const msg = await Messages.create({
                fromId: fromId || null,
                toId: id,
                subject,
                body,
                threadId: newThreadId,
                documents: documents || [],
                date: new Date(),
                lu: false,
                traite: false
            });
            res.json({ message: 'Message envoyé', threadId: newThreadId, msg });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Lire la boîte de réception (pagination)
    getInbox: async (req, res) => {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const { count, rows } = await Messages.findAndCountAll({
                where: { toId: id },
                order: [['date', 'DESC']],
                offset: (page - 1) * limit,
                limit
            });
            res.json({ inbox: rows, total: count });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Lire les fils de discussion (threads)
    getInboxThreads: async (req, res) => {
        try {
            const { id } = req.params;
            const messages = await Messages.findAll({
                where: { toId: id },
                order: [['date', 'ASC']]
            });
            // Regrouper par threadId
            const threads = {};
            messages.forEach(msg => {
                if (!threads[msg.threadId]) threads[msg.threadId] = [];
                threads[msg.threadId].push(msg);
            });
            res.json({ threads });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Supprimer un message
    deleteInboxMessage: async (req, res) => {
        try {
            const { id, msgId } = req.params;
            const msg = await Messages.findOne({ where: { id: msgId, toId: id } });
            if (!msg) return res.status(404).json({ message: 'Message non trouvé' });
            await msg.destroy();
            res.json({ message: 'Message supprimé' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Marquer un message comme traité
    markInboxMessageAsTreated: async (req, res) => {
        try {
            const { id, msgId } = req.params;
            const msg = await Messages.findOne({ where: { id: msgId, toId: id } });
            if (!msg) return res.status(404).json({ message: 'Message non trouvé' });
            msg.traite = true;
            await msg.save();
            res.json({ message: 'Message marqué comme traité' });
        } catch (err) {
            res.status(500).json({ message: 'Erreur serveur', error: err.message });
        }
    },

    // Marquer un message comme lu
    markInboxMessageAsRead: async (req, res) => {
        try {
            const { id, msgId } = req.params;
            const msg = await Messages.findOne({ where: { id: msgId, toId: id } });
            if (!msg) return res.status(404).json({ message: 'Message non trouvé' });
            msg.lu = true;
            await msg.save();
            res.json({ message: 'Message marqué comme lu' });
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

    // Réactiver un compte utilisateur soft deleted
    restoreAccount: async (userId) => {
        try {
            const user = await User.findByPk(userId, { paranoid: false });
            if (!user) throw new Error('Utilisateur non trouvé');
            await user.restore();
            user.isSoftDeleted = false;
            await user.save();
            console.log(`Le compte de l'utilisateur ${user.username} a été réactivé.`);
        } catch (error) {
            console.error('Erreur lors de la réactivation du compte :', error);
            throw error;
        }
    },
};

module.exports = userController;
