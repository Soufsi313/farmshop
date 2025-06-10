const express = require('express');
const contactController = require('../controllers/contactController');
const lusca = require('lusca');
const auth = require('../middleware/auth');

const router = express.Router();

// Envoyer une demande de contact (visiteur)
router.post('/send', lusca.csrf(), async (req, res) => {
    try {
        const contact = await contactController.sendContact(req.body);
        res.status(201).json(contact);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Récupérer toutes les demandes de contact (admin)
router.get('/all', auth.authenticateJWT, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Admin only.');
        }
        const contacts = await contactController.getAllContacts();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Marquer une demande comme lue (admin)
router.put('/read/:id', auth.authenticateJWT, lusca.csrf(), async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).send('Admin only.');
        }
        await contactController.markAsRead(req.params.id);
        res.status(200).send('Demande marquée comme lue.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
