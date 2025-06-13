const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');

const Cart = sequelize.define('Cart', {
    status: {
        type: DataTypes.ENUM('pending', 'ordered'),
        defaultValue: 'pending',
    }
}, {
    timestamps: true,
});

// Associations
Cart.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = Cart;
