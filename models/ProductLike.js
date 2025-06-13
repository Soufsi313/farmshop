const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');
const Product = require('./Products');

const ProductLike = sequelize.define('ProductLike', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: User, key: 'id' },
    onDelete: 'CASCADE',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Product, key: 'id' },
    onDelete: 'CASCADE',
  }
}, {
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'productId'] }
  ]
});

ProductLike.belongsTo(User, { foreignKey: 'userId' });
ProductLike.belongsTo(Product, { foreignKey: 'productId' });

module.exports = ProductLike;
