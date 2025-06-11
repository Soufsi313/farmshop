const { Sequelize } = require('sequelize');

// Configuration de la base de données
const sequelize = new Sequelize('farmshop', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log, // Active le log SQL
});

// Test de connexion
sequelize.authenticate()
    .then(() => console.log('Connexion à la base de données réussie.'))
    .catch(err => console.error('Erreur de connexion à la base de données :', err));

module.exports = sequelize;
