const cron = require('node-cron');
const Orders = require('../models/Orders');
const Users = require('../models/Users');
const sendMail = require('../utils/sendMail'); // À adapter selon ton utilitaire mail

// Ordre des statuts
const STATUS_FLOW = ['confirmed', 'processing', 'expédié', 'livré'];

// Cron toutes les 1min30
cron.schedule('*/1 * * * *', async () => {
  try {
    // Récupère toutes les commandes non livrées
    const orders = await Orders.findAll({ where: { status: ['confirmed', 'processing', 'expédié'] } });
    for (const order of orders) {
      const currentIndex = STATUS_FLOW.indexOf(order.status);
      if (currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1) {
        const newStatus = STATUS_FLOW[currentIndex + 1];
        order.status = newStatus;
        await order.save();
        // Envoi email à l'utilisateur
        const user = await Users.findByPk(order.userId);
        if (user && user.email) {
          await sendMail({
            to: user.email,
            subject: `Mise à jour de votre commande #${order.id}`,
            html: `<p>Bonjour ${user.firstName},<br>Le statut de votre commande est maintenant : <b>${newStatus}</b>.</p>`
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
