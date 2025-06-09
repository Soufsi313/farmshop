const sequelize = require('../config/database');
const User = require('./Users');

// Synchronisation des modèles avec la base de données
sequelize.sync()
    .then(() => {
        console.log('Les modèles ont été synchronisés avec la base de données.');
        console.log('Modèle Users synchronisé.');
    })
    .catch(err => console.error('Erreur lors de la synchronisation des modèles :', err));

module.exports = sequelize;
