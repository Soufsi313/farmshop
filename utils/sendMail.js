// utils/sendMail.js
// Utilitaire d'envoi d'email avec nodemailer
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

/**
 * Envoie un email
 * @param {string} to - Destinataire
 * @param {string} subject - Sujet
 * @param {string} html - Contenu HTML
 * @returns {Promise}
 */
function sendMail({ to, subject, html }) {
    return transporter.sendMail({
        from: `FarmShop <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
    });
}

module.exports = sendMail;
