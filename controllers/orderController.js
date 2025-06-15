const Orders = require('../models/Orders');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Products');
const SpecialOffer = require('../models/SpecialOffer');
const { Op } = require('sequelize');

// TVA alimentaire
const TVA_RATE = 6.0;

const orderController = {
  // Créer une commande à partir du panier
  createOrderFromCart: async (req, res) => {
    try {
      const userId = req.user.id;
      // Récupérer le panier en cours
      const cart = await Cart.findOne({
        where: { userId, status: 'pending' },
        include: [{
          model: CartItem,
          as: 'CartItems',
          include: [{
            model: Product,
            include: [{ model: SpecialOffer, as: 'specialOffer', required: false }]
          }]
        }]
      });
      if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
        return res.status(400).json({ message: 'Votre panier est vide.' });
      }
      // Créer la commande
      const order = await Orders.create({
        userId,
        status: 'pending',
        // Ajoute ici les infos de livraison/frais si besoin (à compléter)
      });
      // Pour chaque item du panier, créer un OrderItem
      for (const item of cart.CartItems) {
        const product = item.Product;
        const offer = product.specialOffer;
        const qty = item.quantity;
        const unitPrice = product.price;
        let discount = 0;
        if (offer && offer.active && qty >= (offer.minQuantity || 0)) {
          if (offer.discountType === 'percentage') {
            discount = unitPrice * (offer.discountValue / 100) * qty;
          } else if (offer.discountType === 'fixed') {
            discount = offer.discountValue * qty;
          }
        }
        const totalHT = unitPrice * qty - discount;
        const tva = totalHT * (TVA_RATE / 100);
        const totalTTC = totalHT + tva;
        await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          quantity: qty,
          unitPrice,
          specialOfferDiscount: discount,
          totalPriceHT: totalHT,
          tvaRate: TVA_RATE,
          totalPriceTTC: totalTTC,
        });
      }
      // Marquer le panier comme "commandé"
      cart.status = 'ordered';
      await cart.save();
      res.status(201).json({ message: 'Commande créée avec succès', orderId: order.id });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Récupérer les commandes d'un utilisateur
  getUserOrders: async (req, res) => {
    try {
      const userId = req.user.id;
      const orders = await Orders.findAll({
        where: { userId },
        include: [{
          model: OrderItem,
          as: 'OrderItems',
          include: [{ model: Product }]
        }],
        order: [['createdAt', 'DESC']]
      });
      res.json({ orders });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Annulation de commande
  cancelOrder: async (req, res) => {
    const orderId = req.params.id;
    try {
      const order = await Orders.findByPk(orderId);
      if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
      // Blocage si la commande est déjà expédiée ou après
      if ([ 'expédié', 'shipped', 'delivered', 'cancelled', 'returned' ].includes(order.status)) {
        return res.status(400).json({ error: "Impossible d'annuler une commande déjà expédiée." });
      }
      order.status = 'cancelled';
      await order.save();
      res.json({ message: 'Commande annulée avec succès.' });
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors de l\'annulation de la commande.' });
    }
  },

  // Retour de commande
  returnOrder: async (req, res) => {
    const orderId = req.params.id;
    try {
      const order = await Orders.findByPk(orderId);
      if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
      if (order.status !== 'delivered') {
        return res.status(400).json({ error: 'Retour possible uniquement si la commande est livrée.' });
      }
      // Vérifier les produits périssables
      const items = await OrderItem.findAll({ where: { orderId }, include: [Product] });
      const perishable = items.find(item => item.Product && item.Product.isPerishable);
      if (perishable) {
        return res.status(400).json({ error: 'Retour impossible pour les produits périssables.' });
      }
      order.status = 'returned';
      await order.save();
      res.json({ message: 'Commande retournée avec succès.' });
    } catch (err) {
      res.status(500).json({ error: 'Erreur lors du retour de la commande.' });
    }
  },
};

module.exports = orderController;
