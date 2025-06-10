const express = require('express');
const productController = require('../controllers/productController');
const lusca = require('lusca');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Ajouter un produit
router.post('/add',
    auth.authenticateJWT,
    lusca.csrf(),
    [
        body('name').isString().notEmpty(),
        body('price').isFloat({ min: 0 }),
        body('category').isString().notEmpty(),
        body('symbol').isIn(['Au kg', 'À la pièce', 'Au litre']),
        body('criticalThreshold').isInt({ min: 0 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            await productController.addProduct(req.body);
            res.status(201).send('Produit ajouté avec succès.');
        } catch (error) {
            res.status(400).send(error.message);
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

module.exports = router;
