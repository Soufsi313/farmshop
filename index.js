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
const messagesRoutes = require('./routes/messagesRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const specialOfferRoutes = require('./routes/specialOfferRoutes');
const securityMiddleware = require('./config/securityMiddleware');
const lusca = require('lusca');
const session = require('express-session');
const blogCommentRoutes = require('./routes/blogCommentRoutes');
const productLikeRoutes = require('./routes/productLikeRoutes');
const path = require('path');
const cartRoutes = require('./routes/cartRoutes');
const cartItemRoutes = require('./routes/cartItemRoutes');
const orderItemRoutes = require('./routes/orderItemRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const stripeWebhookRoutes = require('./routes/stripeWebhookRoutes');
const orderActionsRoutes = require('./routes/orderActionsRoutes');
require('dotenv').config(); // Ajout du support .env pour les clés Stripe

const app = express();

// Middleware pour gérer les requêtes JSON
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook/stripe') {
    next(); // Laisse express.raw gérer le webhook Stripe
  } else {
    express.json()(req, res, next);
  }
});
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
// et sauf pour les routes Stripe payment (API sécurisée par JWT)
// et sauf pour le webhook Stripe (pas de CSRF sur /webhook/stripe)
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    // Désactive CSRF pour la suppression d'un message d'inbox
    if (req.method === "DELETE" && /^\/users\/\d+\/inbox\/\d+$/.test(req.path)) {
      return next();
    }
    // Désactive CSRF pour les routes Stripe payment
    if (/^\/api\/payment\//.test(req.path)) {
      return next();
    }
    // Désactive CSRF pour le webhook Stripe
    if (req.originalUrl === '/webhook/stripe') {
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

// Middleware pour capturer le raw body sur /webhook/stripe
app.use('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  next();
});

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
app.use('/orders', orderActionsRoutes);
app.use('/locations', locationRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cookies', cookiesRoutes);
app.use('/messages', messagesRoutes);
app.use('/categories', categoryRoutes);
app.use('/special-offers', specialOfferRoutes);
app.use('/blog-comments', blogCommentRoutes);
app.use('/product-likes', productLikeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/cartitem', cartItemRoutes);
app.use('/order-items', orderItemRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/webhook', stripeWebhookRoutes);

// Lancement du cron de mise à jour des statuts de commande
require('./cron/orderStatusCron');

// Fallback SPA : sert index.html du dossier client/public UNIQUEMENT pour les routes qui ne commencent PAS par une route API connue
app.get(/^\/(?!api|products|categories|special-offers|users|orders|wishlist|cart-location|contact|newsletter|locations|cookies|messages|blogs|blog-comments|uploads)(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'public', 'index.html'));
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
