const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');

const Cookies = sequelize.define('Cookies', {
    accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    refused: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    consentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    timestamps: true,
});

Cookies.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = Cookies;
