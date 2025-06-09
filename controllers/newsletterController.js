const Newsletter = require('../models/Newsletter');
const User = require('../models/Users');

const newsletterController = {
    // S'abonner à la newsletter
    subscribe: async (email, userId = null) => {
        try {
            let newsletter = await Newsletter.findOne({ where: { email } });
            if (newsletter) {
                newsletter.isSubscribed = true;
                if (userId) newsletter.userId = userId;
                await newsletter.save();
            } else {
                newsletter = await Newsletter.create({ email, isSubscribed: true, userId });
            }
            return newsletter;
        } catch (error) {
            throw error;
        }
    },

    // Se désabonner de la newsletter
    unsubscribe: async (email) => {
        try {
            const newsletter = await Newsletter.findOne({ where: { email } });
            if (!newsletter) throw new Error('Adresse email non trouvée.');
            newsletter.isSubscribed = false;
            await newsletter.save();
        } catch (error) {
            throw error;
        }
    },

    // Récupérer tous les abonnés (admin)
    getAllSubscribers: async () => {
        try {
            const subscribers = await Newsletter.findAll({ where: { isSubscribed: true } });
            return subscribers;
        } catch (error) {
            throw error;
        }
    },

    // Envoyer une newsletter (simulation)
    sendNewsletter: async (subject, content) => {
        try {
            const subscribers = await Newsletter.findAll({ where: { isSubscribed: true } });
            // Ici, on simule l'envoi d'un email à chaque abonné
            subscribers.forEach(sub => {
                console.log(`Newsletter envoyée à : ${sub.email} | Sujet : ${subject}`);
            });
        } catch (error) {
            throw error;
        }
    },
};

module.exports = newsletterController;
