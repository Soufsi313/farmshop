const express = require('express');
const contactController = require('../controllers/contactController');
const lusca = require('lusca');

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
router.get('/all', async (req, res) => {
    try {
        const contacts = await contactController.getAllContacts();
        res.status(200).json(contacts);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Marquer une demande comme lue (admin)
router.put('/read/:id', lusca.csrf(), async (req, res) => {
    try {
        await contactController.markAsRead(req.params.id);
        res.status(200).send('Demande marquée comme lue.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;
