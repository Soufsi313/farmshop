const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./Users');

const Newsletter = sequelize.define('Newsletter', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    isSubscribed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
});

// Association avec User (optionnel, pour lier l'abonnement à un utilisateur)
Newsletter.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = Newsletter;
