// Importation des modules nécessaires
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const blogRoutes = require('./routes/blogRoutes');
const cartLocationRoutes = require('./routes/cartLocationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const locationRoutes = require('./routes/locationRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cookiesRoutes = require('./routes/cookiesRoutes');
const securityMiddleware = require('./config/securityMiddleware');
const lusca = require('lusca');
const session = require('express-session');

const app = express();

// Middleware pour gérer les requêtes JSON
app.use(express.json());
app.use(securityMiddleware);

// Active le mode proxy pour que express-rate-limit fonctionne correctement derrière un proxy (React dev server)
app.set('trust proxy', 1);

// Ajout du middleware express-session AVANT lusca
app.use(session({
  secret: 'farmshop_secret_key', // à personnaliser en prod
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // true en prod avec HTTPS
}));

// Applique lusca.csrf() sur toutes les requêtes non-GET (PUT, POST, PATCH, DELETE),
// sauf pour la suppression d'un message d'inbox (DELETE /users/:id/inbox/:msgIndex)
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    // Désactive CSRF pour la suppression d'un message d'inbox
    if (req.method === "DELETE" && /^\/users\/\d+\/inbox\/\d+$/.test(req.path)) {
      return next();
    }
    return lusca.csrf()(req, res, next);
  }
  next();
});

// Servir les fichiers statiques du dossier uploads avec les bons headers CORS
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Route de base
app.get('/', (req, res) => {
    res.send('Bienvenue sur FarmShop, votre boutique en ligne !');
});

// Route pour exposer le token CSRF au frontend (lusca uniquement)
app.get('/csrf-token', lusca.csrf(), (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Utilisation des routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/blogs', blogRoutes);
app.use('/cart-location', cartLocationRoutes);
app.use('/contact', contactRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/orders', ordersRoutes);
app.use('/locations', locationRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cookies', cookiesRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
