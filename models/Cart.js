const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');
const Product = require('./Products');

const Cart = sequelize.define('Cart', {
    quantity: {
        type: DataTypes.INTEGER,
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
Cart.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

// Unicité d'un produit dans un panier utilisateur
Cart.addHook('beforeValidate', async (cart, options) => {
    const existing = await Cart.findOne({
        where: {
            userId: cart.userId,
            productId: cart.productId,
            status: 'pending',
        }
    });
    if (existing && (!cart.id || cart.id !== existing.id)) {
        throw new Error('Ce produit est déjà dans votre panier.');
    }
});

module.exports = Cart;
