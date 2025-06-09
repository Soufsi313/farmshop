const sequelize = require('../config/database');
const User = require('./Users');
const Product = require('./Products');
const Blog = require('./Blogs');
const Cart = require('./Cart');
const CartLocation = require('./CartLocation');
const Contact = require('./Contact');
const Newsletter = require('./Newsletter');

// Synchronisation des modèles avec la base de données
sequelize.sync()
    .then(() => {
        console.log('Les modèles ont été synchronisés avec la base de données.');
        console.log('Modèle Users synchronisé.');
        console.log('Modèle Products synchronisé.');
        console.log('Modèle Blogs synchronisé.');
        console.log('Modèle Cart synchronisé.');
        console.log('Modèle CartLocation synchronisé.');
        console.log('Modèle Contact synchronisé.');
        console.log('Modèle Newsletter synchronisé.');
    })
    .catch(err => console.error('Erreur lors de la synchronisation des modèles :', err));

module.exports = sequelize;
