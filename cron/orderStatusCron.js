const cron = require('node-cron');
const Orders = require('../models/Orders');
const Users = require('../models/Users');
const sendMail = require('../utils/sendMail'); // À adapter selon ton utilitaire mail

// Ordre des statuts
const STATUS_FLOW = ['confirmed', 'preparation', 'shipped', 'delivered'];

const STATUS_LABELS = {
  confirmed: 'Confirmée',
  preparation: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée'
};

const STATUS_EMAIL_TEMPLATES = {
  confirmed: (user, order) => `<p>Bonjour ${user.username},<br>Votre commande #${order.id} a été <b>confirmée</b>. Nous allons la préparer sous peu.</p>`,
  preparation: (user, order) => `<p>Bonjour ${user.username},<br>Votre commande #${order.id} est <b>en préparation</b>. Elle sera bientôt expédiée.</p>`,
  shipped: (user, order) => `<p>Bonjour ${user.username},<br>Votre commande #${order.id} a été <b>expédiée</b> ! Vous la recevrez prochainement.</p>`,
  delivered: (user, order) => `<p>Bonjour ${user.username},<br>Votre commande #${order.id} a été <b>livrée</b>. Merci pour votre confiance !</p>`
};

// Cron toutes les 1min30
cron.schedule('*/1 * * * *', async () => {
  try {
    // Récupère toutes les commandes non livrées
    const orders = await Orders.findAll({ where: { status: ['confirmed', 'preparation', 'shipped'] } });
    for (const order of orders) {
      const currentIndex = STATUS_FLOW.indexOf(order.status);
      if (currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1) {
        const newStatus = STATUS_FLOW[currentIndex + 1];
        order.status = newStatus;
        await order.save();
        // Envoi email à l'utilisateur
        const user = await Users.findByPk(order.userId);
        if (user && user.email) {
          const html = STATUS_EMAIL_TEMPLATES[newStatus](user, order);
          await sendMail({
            to: user.email,
            subject: `Mise à jour de votre commande #${order.id} : ${STATUS_LABELS[newStatus]}`,
            html
          });
        }
        console.log(`Commande #${order.id} passée à ${newStatus}`);
      }
    }
  } catch (err) {
    console.error('Erreur cron statut commande :', err);
  }
});

module.exports = {};
