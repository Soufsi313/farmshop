const express = require('express');
const messagesController = require('../controllers/messagesController');
const lusca = require('lusca');
const auth = require('../middleware/auth');

const router = express.Router();

// Envoyer un message (auth obligatoire pour l'expéditeur)
router.post('/', lusca.csrf(), auth.authenticateJWT, messagesController.send);

// Lire la boîte de réception (auth obligatoire pour le destinataire, pas de CSRF)
router.get('/:toId/inbox', auth.authenticateJWT, messagesController.inbox);

// Lire les threads (auth obligatoire pour le destinataire, pas de CSRF)
router.get('/:toId/threads', auth.authenticateJWT, messagesController.threads);

// Supprimer un message (auth obligatoire pour le destinataire)
router.delete('/:toId/:msgId', lusca.csrf(), auth.authenticateJWT, messagesController.delete);

// Marquer comme traité (auth obligatoire pour le destinataire)
router.patch('/:toId/:msgId/traite', lusca.csrf(), auth.authenticateJWT, messagesController.markTreated);

// Marquer comme lu (auth obligatoire pour le destinataire)
router.patch('/:toId/:msgId/lu', lusca.csrf(), auth.authenticateJWT, messagesController.markRead);

module.exports = router;
