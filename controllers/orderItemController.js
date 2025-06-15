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
        paymentMethod: 'stripe', // ou 'pending' si tu veux le mettre à jour plus tard
        // Ajoute ici les infos de livraison/frais si besoin (à compléter)
      });
      // Calcul du total TTC de la commande (TVA 6% pour alimentaire, 21% sinon)
      let totalTTCCommande = 0;
      let totalHTProduits = 0;
      let totalTVA6 = 0;
      let totalTVA21 = 0;
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
        // Correction : charger la catégorie réelle
        let catName = '';
        if (product.category && typeof product.category === 'object' && product.category.name) {
          catName = product.category.name.toLowerCase();
        } else if (product.categoryId) {
          const cat = await Category.findByPk(product.categoryId);
          if (cat) catName = cat.name.toLowerCase();
          else console.warn('Catégorie non trouvée pour le produit', product.id, '| categoryId =', product.categoryId);
        } else {
          console.warn('Aucune catégorie pour le produit', product.id);
        }
        const foodCategories = [
          "food", "alimentaire", "alimentation", "fruits", "légumes", "fruits et légumes"
        ];
        const isFood = foodCategories.includes(catName);
        // Utiliser le taux de TVA du produit
        const tvaRate = product.tax_rate !== undefined ? Number(product.tax_rate) : 21;
        const tva = totalHT * (tvaRate / 100);
        const totalTTC = totalHT + tva;
        totalTTCCommande += totalTTC;
        totalHTProduits += totalHT;
        if (tvaRate === 6) totalTVA6 += tva; else totalTVA21 += tva;
        await OrderItem.create({
          orderId: order.id,
          productId: product.id,
          quantity: qty,
          unitPrice,
          specialOfferDiscount: discount,
          totalPriceHT: totalHT,
          tvaRate,
          totalPriceTTC: totalTTC,
        });
        // Décrémenter le stock du produit
        product.quantity = Math.max(0, product.quantity - qty);
        await product.save();
        // Alerte seuil critique : message interne à l'admin si stock <= seuil
        if (product.quantity <= product.criticalThreshold) {
          // Récupérer l'admin
          const admin = await User.findOne({ where: { role: 'Admin' } });
          if (admin) {
            await Messages.create({
              fromId: null,
              toId: admin.id,
              subject: `Alerte stock critique : ${product.name}`,
              body: `Le stock du produit "${product.name}" est passé sous le seuil critique (${product.criticalThreshold}). Stock actuel : ${product.quantity}.`,
              date: new Date(),
              lu: false,
              traite: false
            });
          }
        }
      }
      // Déterminer le taux de TVA livraison selon la règle belge
      let livraisonTauxTVA = 6; // Par défaut 6%
      for (const item of cart.CartItems) {
        const product = item.Product;
        let catName = '';
        if (product.category && typeof product.category === 'object' && product.category.name) {
          catName = product.category.name.toLowerCase();
        } else if (product.categoryId) {
          const cat = await Category.findByPk(product.categoryId);
          if (cat) catName = cat.name.toLowerCase();
        }
        const foodCategories = [
          "food", "alimentaire", "alimentation", "fruits", "légumes", "fruits et légumes"
        ];
        if (!foodCategories.includes(catName)) {
          livraisonTauxTVA = 21;
          break;
        }
      }
      // Frais de livraison TTC fixes (2,50€ si < 25€ TTC produits)
      let fraisLivraisonTTC = totalTTCCommande >= 25 ? 0 : 2.50;
      totalTTCCommande += fraisLivraisonTTC;
      order.totalTTC = totalTTCCommande;
      order.shippingFees = fraisLivraisonTTC;
      await order.save();
      console.log('Commande créée :', order.id, '| totalTTC enregistré =', order.totalTTC);
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
          include: [{ model: Product, include: ['category'] }]
        }],
        order: [['createdAt', 'DESC']]
      });
      res.json({ orders });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = orderItemController;
