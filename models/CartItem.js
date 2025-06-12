const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cart = require('./Cart');
const Product = require('./Products');

const CartItem = sequelize.define('CartItem', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    timestamps: true,
});

CartItem.belongsTo(Cart, { foreignKey: 'cartId', onDelete: 'CASCADE' });
CartItem.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

module.exports = CartItem;
