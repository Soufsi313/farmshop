// controllers/stripeWebhookController.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Orders = require('../models/Orders');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Products');
const User = require('../models/Users');
const sendMail = require('../utils/sendMail');

// Pour vérifier la signature du webhook Stripe
const endpointSecretCLI = process.env.STRIPE_WEBHOOK_SECRET_CLI;
const endpointSecretDashboard = process.env.STRIPE_WEBHOOK_SECRET_DASHBOARD;

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  let lastError;
  // On tente d'abord avec la clé CLI, puis dashboard
  for (const secret of [endpointSecretCLI, endpointSecretDashboard]) {
    if (!secret) continue;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);
      lastError = null;
      break;
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError) {
    console.error('⚠️  Webhook signature verification failed with both secrets.', lastError.message);
    return res.status(400).send(`Webhook Error: ${lastError.message}`);
  }

  // Gérer les événements Stripe utiles
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Webhook Stripe: checkout.session.completed reçu, session:', session);
      const orderId = session.metadata?.orderId;
      if (orderId) {
        try {
          // Met à jour la commande comme payée
          const order = await Orders.findByPk(orderId);
          if (order) {
            await Orders.update(
              { status: 'confirmed', paymentMethod: 'stripe', invoiceUrl: null },
              { where: { id: orderId } }
            );
            console.log('Commande mise à jour comme confirmée (orderId =', orderId, ')');
            // Vide le panier associé à l'utilisateur
            if (order.userId) {
              const cart = await Cart.findOne({ where: { userId: order.userId, status: 'pending' } });
              if (cart) {
                await CartItem.destroy({ where: { cartId: cart.id } });
                cart.status = 'ordered';
                await cart.save();
                console.log('Panier vidé et marqué comme commandé pour userId', order.userId);
              } else {
                console.log('Aucun panier à vider pour userId', order.userId);
              }
            }
            // MAJ STOCK : décrémente le stock pour chaque OrderItem
            const orderItems = await OrderItem.findAll({ where: { orderId }, include: [Product] });
            for (const item of orderItems) {
              if (item.Product) {
                item.Product.quantity = Math.max(0, item.Product.quantity - item.quantity);
                await item.Product.save();
                // Optionnel : alerte seuil critique
                if (item.Product.quantity <= item.Product.criticalThreshold) {
                  // Message interne à l'admin
                  const admin = await User.findOne({ where: { role: 'Admin' } });
                  if (admin) {
                    await require('../models/Messages').create({
                      fromId: null,
                      toId: admin.id,
                      subject: `Alerte stock critique : ${item.Product.name}`,
                      body: `Le stock du produit "${item.Product.name}" est passé sous le seuil critique (${item.Product.criticalThreshold}). Stock actuel : ${item.Product.quantity}.`,
                      date: new Date(),
                      lu: false,
                      traite: false
                    });
                  }
                }
              }
            }
            // ENVOI EMAIL confirmation commande
            const user = await User.findByPk(order.userId);
            if (user && user.email) {
              await sendMail({
                to: user.email,
                subject: `Confirmation de votre commande #${order.id}`,
                html: `<h2>Merci pour votre commande !</h2><p>Votre commande #${order.id} a bien été confirmée et sera traitée prochainement.</p>`
              });
              console.log('Email de confirmation envoyé à', user.email);
            }
            console.log('Commande validée, stock mis à jour et email envoyé ! (orderId =', orderId, ')');
          } else {
            console.log('Commande non trouvée pour orderId', orderId);
          }
        } catch (err) {
          console.error('Erreur lors de la mise à jour de la commande, du stock ou de l\'envoi d\'email :', err);
        }
      } else {
        console.log('Aucun orderId trouvé dans la session Stripe');
      }
      break;
    }
    // Ajouter d'autres cas si besoin
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
