const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    symbol: {
        type: DataTypes.ENUM('Au kg', 'À la pièce', 'Au litre'),
        allowNull: false,
    },
    mainImage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    galleryImages: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    criticalThreshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
});

module.exports = Product;
