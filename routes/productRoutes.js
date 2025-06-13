const express = require('express');
const productController = require('../controllers/productController');
const lusca = require('lusca');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const productUpload = require('../middleware/productUpload');

const router = express.Router();

// Ajouter un produit
router.post('/add',
    auth.authenticateJWT,
    lusca.csrf(),
    productUpload.fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'galleryImages', maxCount: 10 }
    ]),
    async (req, res) => {
        try {
            // Construction des données produit à partir de req.body et des fichiers uploadés
            const data = { ...req.body };
            if (req.files && req.files.mainImage && req.files.mainImage[0]) {
                data.mainImage = '/uploads/' + req.files.mainImage[0].filename;
            }
            if (req.files && req.files.galleryImages) {
                data.galleryImages = req.files.galleryImages.map(f => '/uploads/' + f.filename);
            }
            // Conversion des champs numériques
            // galleryImages doit être null si aucune image n'est uploadée
            if (!data.galleryImages) data.galleryImages = null;
            // isAvailable doit être booléen
            if (typeof data.isAvailable === 'string') {
                data.isAvailable = data.isAvailable === 'true' || data.isAvailable === 'on' || data.isAvailable === '1';
            }
            // criticalThreshold et autres champs numériques
            if (data.criticalThreshold !== undefined && data.criticalThreshold !== null && data.criticalThreshold !== '') {
                data.criticalThreshold = parseInt(data.criticalThreshold);
            } else {
                data.criticalThreshold = 0;
            }
            if (data.price !== undefined && data.price !== null && data.price !== '') {
                data.price = parseFloat(data.price);
            } else {
                data.price = 0;
            }
            if (data.quantity !== undefined && data.quantity !== null && data.quantity !== '') {
                data.quantity = parseInt(data.quantity);
            } else {
                data.quantity = 0;
            }
            if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== '') {
                data.categoryId = parseInt(data.categoryId);
            } else {
                data.categoryId = null;
            }
            // Supprimer le champ id si présent (pour éviter 'null' explicite ou string 'null')
            if (data.id === undefined || data.id === null || data.id === 'null' || data.id === '') {
                delete data.id;
            }
            await productController.addProduct(data);
            res.status(201).json({ message: 'Produit ajouté avec succès.' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Modifier un produit (update)
router.put('/:id',
    auth.authenticateJWT,
    lusca.csrf(),
    productUpload.fields([
      { name: 'mainImage', maxCount: 1 },
      { name: 'galleryImages', maxCount: 10 }
    ]),
    async (req, res) => {
        try {
            const data = { ...req.body };
            if (req.files && req.files.mainImage && req.files.mainImage[0]) {
                data.mainImage = '/uploads/' + req.files.mainImage[0].filename;
            }
            if (req.files && req.files.galleryImages) {
                data.galleryImages = req.files.galleryImages.map(f => '/uploads/' + f.filename);
            }
            if (!data.galleryImages) data.galleryImages = null;
            if (typeof data.isAvailable === 'string') {
                data.isAvailable = data.isAvailable === 'true' || data.isAvailable === 'on' || data.isAvailable === '1';
            }
            if (data.criticalThreshold !== undefined && data.criticalThreshold !== null && data.criticalThreshold !== '') {
                data.criticalThreshold = parseInt(data.criticalThreshold);
            } else {
                data.criticalThreshold = 0;
            }
            if (data.price !== undefined && data.price !== null && data.price !== '') {
                data.price = parseFloat(data.price);
            } else {
                data.price = 0;
            }
            if (data.quantity !== undefined && data.quantity !== null && data.quantity !== '') {
                data.quantity = parseInt(data.quantity);
            } else {
                data.quantity = 0;
            }
            if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== '') {
                data.categoryId = parseInt(data.categoryId);
            } else {
                data.categoryId = null;
            }
            await productController.updateProduct(req.params.id, data);
            res.status(200).json({ message: 'Produit modifié avec succès.' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
);

// Trier les produits par critère (catégorie, prix)
router.get('/sort', async (req, res) => {
    try {
        const { criteria, order } = req.query;
        await productController.sortProducts(criteria, order);
        res.status(200).send('Produits triés.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Rechercher un produit
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        await productController.searchProduct(q);
        res.status(200).send('Recherche effectuée.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Ajouter à la liste de souhaits
router.post('/wishlist', lusca.csrf(), async (req, res) => {
    try {
        const { userId, productId } = req.body;
        await productController.addToWishlist(userId, productId);
        res.status(200).send('Produit ajouté à la liste de souhaits.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Liker et partager un produit
router.post('/like-share', lusca.csrf(), async (req, res) => {
    try {
        const { productId, userId } = req.body;
        await productController.likeAndShareProduct(productId, userId);
        res.status(200).send('Produit liké et partagé.');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Liste paginée, triée, filtrée, recherche produits
router.get('/', productController.getProducts);

// Récupérer un produit par ID (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await require('../controllers/productController').getProductById(req, res);
        // getProductById doit gérer la réponse (res.json)
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
