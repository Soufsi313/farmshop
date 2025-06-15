// Script de vérification et correction du champ totalTTC sur les commandes
// Usage ponctuel : node utils/fixTotalTTC.js

const Orders = require('../models/Orders');
const OrderItem = require('../models/OrderItem');
const Products = require('../models/Products');
const Category = require('../models/Category');
const sequelize = require('../config/database');

const TVA_RATE = 5.5; // À adapter si besoin
const FRAIS_LIVRAISON = 3.5;

async function main() {
  await sequelize.authenticate();
  // 1. Afficher les commandes sans totalTTC ou à recalculer
  const orders = await Orders.findAll();
  for (const order of orders) {
    // Récupérer les items
    const items = await OrderItem.findAll({ where: { orderId: order.id }, include: [Products] });
    let totalTTCCommande = 0;
    let totalHTProduits = 0;
    let totalTVA6 = 0;
    let totalTVA21 = 0;
    for (const item of items) {
      const product = item.Product;
      const unitPrice = Number(item.unitPrice);
      const qty = Number(item.quantity);
      const discount = Number(item.specialOfferDiscount) || 0;
      const totalHT = unitPrice * qty - discount;
      // Correction : charger la catégorie réelle si product.category est un ID
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
      const isFood = foodCategories.includes(catName);
      const tvaRate = isFood ? 6 : 21;
      const tva = totalHT * (tvaRate / 100);
      const totalTTC = totalHT + tva;
      totalTTCCommande += totalTTC;
      totalHTProduits += totalHT;
      if (isFood) totalTVA6 += tva; else totalTVA21 += tva;
    }
    // Frais de livraison : 3.50€ HT + TVA 21% si < 25€ TTC produits
    let fraisLivraisonHT = totalTTCCommande >= 25 ? 0 : 3.50;
    let fraisLivraisonTVA = fraisLivraisonHT > 0 ? fraisLivraisonHT * 0.21 : 0;
    let fraisLivraisonTTC = fraisLivraisonHT + fraisLivraisonTVA;
    totalTTCCommande += fraisLivraisonTTC;
    order.totalTTC = totalTTCCommande;
    order.shippingFees = fraisLivraisonTTC;
    await order.save();
    console.log(`Commande ${order.id} corrigée : totalTTC = ${order.totalTTC}`);
  }
  console.log('Correction terminée.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
