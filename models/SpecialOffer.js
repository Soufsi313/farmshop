const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Products');

const SpecialOffer = sequelize.define('SpecialOffer', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
    },
    discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    minQuantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Association: One offer belongs to one product, one product can have one offer at a time
SpecialOffer.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasOne(SpecialOffer, { foreignKey: 'productId', as: 'specialOffer' });

module.exports = SpecialOffer;
