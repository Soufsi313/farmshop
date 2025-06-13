const express = require('express');
const router = express.Router();
const blogCommentController = require('../controllers/blogCommentController');
const auth = require('../middleware/auth');
const lusca = require('lusca');

// Modifier un commentaire (user seulement)
router.put('/:id', auth.authenticateJWT, lusca.csrf(), blogCommentController.updateComment);
// Supprimer un commentaire (user seulement)
router.delete('/:id', auth.authenticateJWT, lusca.csrf(), blogCommentController.deleteComment);

module.exports = router;
