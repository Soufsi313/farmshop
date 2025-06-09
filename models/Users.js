const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('Admin', 'User'),
        allowNull: false,
    },
    isSubscribedToNewsletter: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isSoftDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    paranoid: true, // Enables soft delete
});

User.prototype.downloadData = function() {
    // Logic to download user data
    console.log(`Downloading data for user: ${this.username}`);
};

module.exports = User;
