const fs = require('fs');
const path = require('path');
const Orders = require('../models/Orders');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Products');
const SpecialOffer = require('../models/SpecialOffer');
const Messages = require('../models/Messages');
const User = require('../models/Users');
const Category = require('../models/Category');
const { Op } = require('sequelize');
const sendMail = require('../utils/sendMail');

// TVA alimentaire
const TVA_RATE = 6.0;

const orderItemController = {
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
        paymentMethod: 'stripe',
        shippingAddress: req.body.shippingAddress || null,
        shippingPostalCode: req.body.shippingPostalCode || null,
        shippingCity: req.body.shippingCity || null,
        shippingCountry: req.body.shippingCountry || null,
      });
      // Préparer le log
      const logLines = [];
      const now = new Date();
      for (const item of cart.CartItems) {
        const product = item.Product;
        let offer = product.specialOffer;
        // DEBUG structure de l'offre spéciale
        console.log('[DEBUG] Offre spéciale pour', product.name, ':', offer);
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
      // Calcul du total produits TTC
      const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
      const totalProduitsTTC = orderItems.reduce((sum, i) => sum + (Number(i.totalPriceTTC) || 0), 0);
      // Application des frais de livraison (2,50€ si < 25€)
      let shippingFees = 0;
      if (totalProduitsTTC < 25) {
        shippingFees = 2.5;
      }
      const totalTTC = parseFloat((totalProduitsTTC + shippingFees).toFixed(2));
      // Mise à jour de la commande avec les totaux
      order.totalTTC = totalTTC;
      order.shippingFees = shippingFees;
      await order.save();
      // Après la mise à jour du stock, vérifier le seuil critique et envoyer une alerte email si besoin
      for (const item of cart.CartItems) {
        const product = item.Product;
        // Décrémenter le stock AVANT de vérifier le seuil critique
        product.quantity = Math.max(0, product.quantity - item.quantity);
        await product.save();
        // Log de debug pour vérifier les valeurs juste avant la condition
        console.log('[DEBUG STOCK] Produit:', product.name, '| Stock après achat:', product.quantity, '| Seuil critique:', product.criticalThreshold);
        if (product.quantity === 0) {
          // Message spécial rupture de stock
          const admin = await User.findOne({ where: { role: 'Admin' } });
          if (admin && admin.id) {
            try {
              const msg = await Messages.create({
                fromId: null,
                toId: admin.id,
                subject: `Rupture de stock : ${product.name}`,
                body: `Le produit <strong>${product.name}</strong> est en rupture de stock (stock actuel : 0).`,
                date: new Date(),
                lu: false,
                traite: false
              });
              console.log('[RUPTURE STOCK] Message créé avec succès, id:', msg.id);
            } catch (err) {
              console.error('[RUPTURE STOCK] Erreur lors de la création du message:', err);
            }
          } else {
            console.warn('[RUPTURE STOCK] Aucun admin trouvé pour l’alerte rupture.');
          }
        } else if (product.quantity <= product.criticalThreshold) {
          console.log('[CRITICAL STOCK] Tentative de création de message admin pour', product.name, 'stock:', product.quantity, 'seuil:', product.criticalThreshold);
          const admin = await User.findOne({ where: { role: 'Admin' } });
          if (admin && admin.id) {
            try {
              const msg = await Messages.create({
                fromId: null,
                toId: admin.id,
                subject: `Alerte stock critique : ${product.name}`,
                body: `Le stock du produit <strong>${product.name}</strong> est passé sous le seuil critique (${product.criticalThreshold}).<br>Stock actuel : <strong>${product.quantity}</strong>.`,
                date: new Date(),
                lu: false,
                traite: false
              });
              console.log('[CRITICAL STOCK] Message créé avec succès, id:', msg.id);
            } catch (err) {
              console.error('[CRITICAL STOCK] Erreur lors de la création du message:', err);
            }
          } else {
            console.warn('[CRITICAL STOCK] Aucun admin trouvé pour l’alerte stock.');
          }
        }
      }
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
          include: [{ model: Product, include: ['category'] }]
        }],
        order: [['createdAt', 'DESC']]
      });
      res.json({ orders });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Récupérer le détail d'une commande par ID
  getOrderDetail: async (req, res) => {
    try {
      const userId = req.user.id;
      const orderId = req.params.id;
      const order = await Orders.findOne({
        where: { id: orderId, userId },
        include: [
          {
            model: OrderItem,
            as: 'OrderItems',
            include: [{ model: Product, include: ['category'] }]
          }
        ]
      });
      if (!order) return res.status(404).json({ message: 'Commande introuvable' });
      res.json({ order });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = orderItemController;
