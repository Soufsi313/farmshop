const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');

const Orders = sequelize.define('Orders', {
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'preparation', 'shipped', 'delivered', 'cancelled', 'returned'),
        defaultValue: 'pending',
    },
    invoiceUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isRefunded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    orderDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    deliveredDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isPerishable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    totalTTC: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Montant total TTC payé pour la commande',
    },
    shippingFees: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Frais de livraison TTC appliqués à la commande',
    }
}, {
    timestamps: true,
});

Orders.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = Orders;
