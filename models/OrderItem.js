const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Orders = require('./Orders');
const Product = require('./Products');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Orders,
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Prix unitaire au moment de la commande (hors remise)',
  },
  specialOfferDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Montant total de la remise appliquée sur cette ligne',
  },
  totalPriceHT: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total hors taxe après remise',
  },
  tvaRate: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    defaultValue: 6.00,
    comment: 'Taux de TVA appliqué (en %)',
  },
  totalPriceTTC: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Total TTC après remise et TVA',
  },
  discountPercent: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Pourcentage de remise appliqué sur la ligne (si applicable)',
  },
  unitPriceDiscounted: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Prix unitaire après remise (pour affichage)',
  },
}, {
  tableName: 'OrderItems',
  timestamps: true,
});

Orders.hasMany(OrderItem, { foreignKey: 'orderId', as: 'OrderItems' });
OrderItem.belongsTo(Orders, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = OrderItem;
