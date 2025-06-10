const express = require('express');
const userController = require('../controllers/userController');
const lusca = require('lusca');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

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
    if (!token) return res.status(400).send('Token manquant.');
    const User = require('../models/Users');
    try {
        const user = await User.findOne({ where: { emailVerificationToken: token } });
        if (!user) return res.status(400).send('Lien de vérification invalide ou expiré.');
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        await user.save();
        res.send('Votre email a bien été vérifié. Vous pouvez maintenant vous connecter.');
    } catch (err) {
        res.status(500).send('Erreur serveur.');
    }
});

module.exports = router;
