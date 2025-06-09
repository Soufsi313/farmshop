const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');
const Product = require('./Products');

const CartLocation = sequelize.define('CartLocation', {
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER, // durée en jours
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'ordered'),
        defaultValue: 'pending',
    }
}, {
    timestamps: true,
});

// Associations
CartLocation.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartLocation.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

// Unicité d'un produit en location dans le panier utilisateur
CartLocation.addHook('beforeValidate', async (cart, options) => {
    const existing = await CartLocation.findOne({
        where: {
            userId: cart.userId,
            productId: cart.productId,
            status: 'pending',
        }
    });
    if (existing && (!cart.id || cart.id !== existing.id)) {
        throw new Error('Ce produit est déjà dans votre panier de location.');
    }
});

module.exports = CartLocation;
