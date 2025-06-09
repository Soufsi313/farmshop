const Cookies = require('../models/Cookies');

const cookiesController = {
    // Accepter les cookies
    acceptCookies: async (userId) => {
        try {
            let cookies = await Cookies.findOne({ where: { userId } });
            if (!cookies) {
                cookies = await Cookies.create({ userId, accepted: true, refused: false, consentDate: new Date() });
            } else {
                cookies.accepted = true;
                cookies.refused = false;
                cookies.consentDate = new Date();
                await cookies.save();
            }
            return cookies;
        } catch (error) {
            throw error;
        }
    },

    // Refuser les cookies
    refuseCookies: async (userId) => {
        try {
            let cookies = await Cookies.findOne({ where: { userId } });
            if (!cookies) {
                cookies = await Cookies.create({ userId, accepted: false, refused: true, consentDate: new Date() });
            } else {
                cookies.accepted = false;
                cookies.refused = true;
                cookies.consentDate = new Date();
                await cookies.save();
            }
            return cookies;
        } catch (error) {
            throw error;
        }
    },

    // Voir l'état des cookies d'un utilisateur
    getCookiesStatus: async (userId) => {
        try {
            const cookies = await Cookies.findOne({ where: { userId } });
            return cookies;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = cookiesController;
