const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');
const Product = require('./Products');

const Wishlist = sequelize.define('Wishlist', {
    // Pas de champs supplémentaires, juste la relation user-produit
}, {
    timestamps: true,
});

Wishlist.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

module.exports = Wishlist;
