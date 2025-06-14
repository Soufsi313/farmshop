// controllers/paymentController.js
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Crée un PaymentIntent Stripe pour le paiement d'une commande
 * @route POST /api/payment/create-intent
 * @body { amount: number (en centimes), currency: string, metadata: {orderId, userId, ...} }
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'eur', metadata = {} } = req.body;
    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Montant invalide (minimum 0,50€)' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      // Vous pouvez ajouter receipt_email, description, etc.
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Erreur création PaymentIntent Stripe:', error);
    res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
};

/**
 * Crée une session Stripe Checkout et renvoie l'URL de redirection
 * @route POST /api/payment/create-checkout-session
 * @body { lineItems: [{name, amount, quantity}], successUrl, cancelUrl }
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { lineItems, successUrl, cancelUrl, metadata = {} } = req.body;
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: 'Aucun produit à payer.' });
    }
    // Utilise directement le montant reçu du frontend (déjà en centimes TTC) pour Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: { name: item.name },
          unit_amount: Number(item.amount),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      // Désactive la collecte d'adresse sur Stripe
      // billing_address_collection: 'auto',
      // shipping_address_collection: undefined,
      automatic_tax: { enabled: false },
      customer_creation: 'always',
      metadata, // Ajout de la metadata (orderId, etc.)
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error('Erreur création session Checkout Stripe:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
  }
};
