const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const CartLocation = require('./CartLocation');
const Product = require('./Products');

const CartItemLocation = sequelize.define('CartItemLocation', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER, // durée en jours
        allowNull: false,
    }
}, {
    timestamps: true,
});

CartItemLocation.belongsTo(CartLocation, { foreignKey: 'cartLocationId', onDelete: 'CASCADE' });
CartItemLocation.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

module.exports = CartItemLocation;
