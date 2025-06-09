// Importation des modules nécessaires
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware pour gérer les requêtes JSON
app.use(express.json());

// Route de base
app.get('/', (req, res) => {
    res.send('Bienvenue sur FarmShop, votre boutique en ligne !');
});

// Utilisation des routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
