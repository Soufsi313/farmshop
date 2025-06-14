// controllers/stripeWebhookController.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Orders = require('../models/Orders');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');

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
            // Vide le panier associé à l'utilisateur
            if (order.userId) {
              const cart = await Cart.findOne({ where: { userId: order.userId, status: 'pending' } });
              if (cart) {
                await CartItem.destroy({ where: { cartId: cart.id } });
                cart.status = 'ordered';
                await cart.save();
                console.log('Panier vidé et marqué comme commandé pour userId', order.userId);
              }
            }
            console.log('Commande validée et payée ! (orderId =', orderId, ')');
          }
        } catch (err) {
          console.error('Erreur lors de la mise à jour de la commande ou du panier :', err);
        }
      } else {
        console.warn('Aucun orderId trouvé dans la session Stripe.');
      }
      break;
    }
    // Ajouter d'autres cas si besoin
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
