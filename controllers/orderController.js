const fs = require('fs');
const path = require('path');
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
    console.log('>>> [DEBUG] Entrée dans createOrderFromCart pour userId:', req.user?.id);
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
      // Préparer le log
      const logLines = [];
      const now = new Date();
      for (const item of cart.CartItems) {
        const product = item.Product;
        let offer = product.specialOffer;
        // DEBUG structure de l'offre spéciale
        console.log('[DEBUG] Offre spéciale pour', product.name, ':', offer);
        // Si jamais c'est un tableau (cas Sequelize), prendre le premier élément
        if (Array.isArray(offer)) {
          offer = offer.length > 0 ? offer[0] : null;
        }
        const qty = item.quantity;
        const unitPrice = parseFloat(product.price);
        const taxRate = parseFloat(product.tax_rate);
        let discount = 0;
        let discountPercent = 0;
        let discountInfo = '';
        // Vérification de la validité de l'offre spéciale
        let offerValid = false;
        if (offer && offer.discountType) {
          const start = offer.startDate ? new Date(offer.startDate) : null;
          const end = offer.endDate ? new Date(offer.endDate) : null;
          if (
            (!start || now >= start) &&
            (!end || now <= end) &&
            qty >= (offer.minQuantity || 0)
          ) {
            offerValid = true;
          }
        }
        if (offer && offerValid) {
          if (offer.discountType === 'percentage') {
            discountPercent = offer.discountValue;
            discount = parseFloat((unitPrice * (discountPercent / 100) * qty).toFixed(2));
            discountInfo = `${discountPercent}% sur ${qty} (min: ${offer.minQuantity})`;
          } else if (offer.discountType === 'fixed') {
            discount = parseFloat((offer.discountValue * qty).toFixed(2));
            discountInfo = `${offer.discountValue}€ x ${qty}`;
          }
        }
        // Prix HT total AVANT remise
        const totalHTBrut = parseFloat((unitPrice * qty).toFixed(2));
        // Prix HT total APRÈS remise
        const totalHT = parseFloat((totalHTBrut - discount).toFixed(2));
        // Prix unitaire remisé (pour affichage)
        const unitPriceDiscounted = offer && offerValid && offer.discountType === 'percentage'
          ? parseFloat((unitPrice * (1 - discountPercent / 100)).toFixed(2))
          : unitPrice;
        // TVA sur le HT remisé
        const tva = parseFloat((totalHT * (taxRate / 100)).toFixed(2));
        // TTC final
        const totalTTC = parseFloat((totalHT + tva).toFixed(2));
        // Log détaillé
        const logLine = `Produit: ${product.name} | Qte: ${qty} | PU: ${unitPrice} | PU remisé: ${unitPriceDiscounted} | HT brut: ${totalHTBrut} | Remise: ${discount} (${discountInfo}) | HT net: ${totalHT} | TVA (${taxRate}%): ${tva} | TTC: ${totalTTC}`;
        console.log(logLine);
        logLines.push(logLine);
        await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          quantity: qty,
          unitPrice, // prix original
          specialOfferDiscount: discount, // montant total de la remise
          totalPriceHT: totalHT,
          tvaRate: taxRate,
          totalPriceTTC: totalTTC,
          // Ajout d'un champ virtuel pour le pourcentage de remise (si besoin côté front)
          discountPercent: discountPercent || null,
          unitPriceDiscounted: unitPriceDiscounted,
        });
      }
      // Écrire les logs dans un fichier
      const logPath = path.join(__dirname, '../logs/order_calculation.log');
      fs.mkdirSync(path.dirname(logPath), { recursive: true });
      fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] Commande user #${userId}\n` + logLines.join('\n') + '\n');
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
