const Contact = require('../models/Contact');

const contactController = {
    // Envoyer une demande de contact (visiteur)
    sendContact: async (contactData) => {
        try {
            const contact = await Contact.create(contactData);
            // Ici, on pourrait notifier l'admin (ex: email ou notification interne)
            console.log(`Nouvelle demande de contact reçue : ${contact.subject} - ${contact.reason}`);
            return contact;
        } catch (error) {
            throw error;
        }
    },

    // Récupérer toutes les demandes pour l'admin
    getAllContacts: async () => {
        try {
            const contacts = await Contact.findAll({ order: [['createdAt', 'DESC']] });
            return contacts;
        } catch (error) {
            throw error;
        }
    },

    // Marquer une demande comme lue
    markAsRead: async (contactId) => {
        try {
            const contact = await Contact.findByPk(contactId);
            if (!contact) throw new Error('Demande non trouvée.');
            contact.status = 'read';
            await contact.save();
        } catch (error) {
            throw error;
        }
    },
};

module.exports = contactController;
