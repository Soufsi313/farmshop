const express = require('express');
const userController = require('../controllers/userController');
const lusca = require('lusca');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const upload = require('../middleware/profileUpload');

const router = express.Router();

// Login route (public)
router.post('/login',
    [
        body('email').isEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 6 }).withMessage('Password required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Handles authentication and JWT issuance
        await require('../middleware/auth').login(req, res);
    }
);

// Register route (public)
router.post('/register',
    [
        body('email').isEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 6 }).withMessage('Password required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        await require('../middleware/auth').register(req, res);
    }
);

// Routes pour le modèle User
router.post('/subscribe-newsletter/:userId', lusca.csrf(), async (req, res) => {
    try {
        await userController.subscribeToNewsletter(req.params.userId);
        res.status(200).send('Abonnement à la newsletter réussi.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/unsubscribe-newsletter/:userId', lusca.csrf(), async (req, res) => {
    try {
        await userController.unsubscribeFromNewsletter(req.params.userId);
        res.status(200).send('Désabonnement de la newsletter réussi.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Example: Protect sensitive user routes (soft delete, download data, contact admin)
router.delete('/soft-delete-account/:userId', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        // Only allow if user is self or admin
        if (parseInt(req.params.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        await userController.softDeleteAccount(req.params.userId);
        res.status(200).send('Compte supprimé de manière douce.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get('/download-data/:userId', auth.authenticateJWT, async (req, res) => {
    try {
        if (parseInt(req.params.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        await userController.downloadUserData(req.params.userId);
        res.status(200).send('Téléchargement des données utilisateur réussi.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/contact-admin/:userId', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (parseInt(req.params.userId) !== req.user.id && req.user.role !== 'Admin') {
            return res.status(403).send('Forbidden.');
        }
        await userController.contactAdmin(req.params.userId, req.body.message);
        res.status(200).send('Message envoyé à l’administrateur.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Route de vérification d'email
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send('<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Validation email - FarmShop</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"><style>body{background:#f8fff5;} .card{margin-top:60px;} .farmshop-title{color:#198754;font-size:2.2rem;letter-spacing:2px;font-weight:bold;}</style></head><body><div class="container"><div class="row justify-content-center"><div class="col-md-8"><div class="card p-4 shadow-lg border-0"><div class="text-center mb-4"><span class="farmshop-title">FarmShop</span></div><h2 class="mb-3 text-danger text-center">Lien invalide</h2><div class="alert alert-danger text-center">Token manquant.</div><div class="text-center mt-4"><a href="/login" class="btn btn-outline-secondary">Retour à la connexion</a></div></div></div></div></div></body></html>');
    const User = require('../models/Users');
    try {
        const user = await User.findOne({ where: { emailVerificationToken: token } });
        if (!user) return res.status(400).send('<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Validation email - FarmShop</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"><style>body{background:#f8fff5;} .card{margin-top:60px;} .farmshop-title{color:#198754;font-size:2.2rem;letter-spacing:2px;font-weight:bold;}</style></head><body><div class="container"><div class="row justify-content-center"><div class="col-md-8"><div class="card p-4 shadow-lg border-0"><div class="text-center mb-4"><span class="farmshop-title">FarmShop</span></div><h2 class="mb-3 text-danger text-center">Lien invalide</h2><div class="alert alert-danger text-center">Lien de vérification invalide ou expiré.</div><div class="text-center mt-4"><a href="/login" class="btn btn-outline-secondary">Retour à la connexion</a></div></div></div></div></div></body></html>');
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        await user.save();
        res.send(`<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Validation email - FarmShop</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"><style>body{background:#f8fff5;} .card{margin-top:60px;} .farmshop-title{color:#198754;font-size:2.2rem;letter-spacing:2px;font-weight:bold;}</style></head><body><div class="container"><div class="row justify-content-center"><div class="col-md-8"><div class="card p-4 shadow-lg border-0"><div class="text-center mb-4"><span class="farmshop-title">FarmShop</span></div><h2 class="mb-3 text-success text-center">Email vérifié !</h2><div class="alert alert-success text-center">Votre email a bien été vérifié.<br>Vous pouvez maintenant vous connecter.</div><div class="text-center mt-4"><a href="/login" class="btn btn-success">Se connecter</a></div></div></div></div></div></body></html>`);
    } catch (err) {
        res.status(500).send('<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Validation email - FarmShop</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"><style>body{background:#f8fff5;} .card{margin-top:60px;} .farmshop-title{color:#198754;font-size:2.2rem;letter-spacing:2px;font-weight:bold;}</style></head><body><div class="container"><div class="row justify-content-center"><div class="col-md-8"><div class="card p-4 shadow-lg border-0"><div class="text-center mb-4"><span class="farmshop-title">FarmShop</span></div><h2 class="mb-3 text-danger text-center">Erreur serveur</h2><div class="alert alert-danger text-center">Une erreur est survenue lors de la validation.</div><div class="text-center mt-4"><a href="/login" class="btn btn-outline-secondary">Retour à la connexion</a></div></div></div></div></div></body></html>');
    }
});

// Route GET pour récupérer les utilisateurs actifs (admin uniquement, avec pagination)
router.get('/active', auth.authenticateJWT, auth.requireAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const { users, total } = await userController.getAllActiveUsers(page, limit);
        res.json({ users, total });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Suppression d'un utilisateur (admin only, pas d'auto-suppression, pas de suppression d'admin)
router.delete('/:userId', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), async (req, res) => {
    try {
        const adminId = req.user.id;
        const userId = req.params.userId;
        await userController.deleteUser(adminId, userId);
        res.status(200).json({ message: 'Utilisateur supprimé.' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Modification du rôle d'un utilisateur (admin only, pas pour soi-même, pas pour un autre admin)
router.patch('/:userId/role', auth.authenticateJWT, auth.requireAdmin, lusca.csrf(), async (req, res) => {
    try {
        const adminId = req.user.id;
        const userId = req.params.userId;
        const { newRole } = req.body;
        const user = await userController.updateUserRole(adminId, userId, newRole);
        res.status(200).json({ message: 'Rôle modifié.', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Mettre à jour la bio
router.put('/:id/bio', lusca.csrf(), userController.updateBio);
// Mettre à jour la photo de profil
router.put('/:id/profile-picture', upload.single('profilePicture'), lusca.csrf(), userController.updateProfilePicture);
// Envoyer un message dans la boîte de réception (support threads)
router.post('/:id/inbox', lusca.csrf(), userController.sendMessageToInbox);
// Lire la boîte de réception (tous les messages)
router.get('/:id/inbox', userController.getInbox);
// Lire les fils de discussion (threads)
router.get('/:id/inbox/threads', lusca.csrf(), userController.getInboxThreads);
// Supprimer un message de la boîte de réception (par index)
router.delete('/:id/inbox/:msgIndex', lusca.csrf(), userController.deleteInboxMessage);
// Marquer un message comme traité (admin ou réponse)
router.patch('/:id/inbox/:msgIndex/traite', lusca.csrf(), userController.markInboxMessageAsTreated);
// Récupérer les infos d'un utilisateur par son id
router.get('/:id', userController.getUser);

module.exports = router;
