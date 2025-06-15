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
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Categories',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
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
    tax_rate: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 21,
        comment: 'Taux de TVA applicable au produit (ex: 6 ou 21)',
    },
}, {
    timestamps: true,
});

module.exports = Product;
