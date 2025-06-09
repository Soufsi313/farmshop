const sequelize = require('../config/database');
const User = require('./Users');
const Product = require('./Products');

// Synchronisation des modèles avec la base de données
sequelize.sync()
    .then(() => {
        console.log('Les modèles ont été synchronisés avec la base de données.');
        console.log('Modèle Users synchronisé.');
        console.log('Modèle Products synchronisé.');
    })
    .catch(err => console.error('Erreur lors de la synchronisation des modèles :', err));

module.exports = sequelize;
