const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');
const Product = require('./Products');

const Location = sequelize.define('Location', {
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('ongoing', 'finished', 'late'),
        defaultValue: 'ongoing',
    },
    penalty: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    invoiceUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    timestamps: true,
});

Location.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Location.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

module.exports = Location;
