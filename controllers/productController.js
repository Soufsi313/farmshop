const { Op } = require('sequelize');
const Product = require('../models/Products');
const wishlistController = require('./wishlistController');

const productController = {
    // Ajouter un produit
    addProduct: async (productData) => {
        try {
            console.log('DÉBOGAGE addProduct - Données reçues :', productData);
            const product = await Product.create(productData);
            console.log(`Produit ajouté : ${product.name}`);
        } catch (error) {
            console.error('Erreur lors de l’ajout du produit :', error);
            throw error;
        }
    },

    // Trier les produits par catégorie ou prix
    sortProducts: async (criteria, order = 'ASC') => {
        try {
            const products = await Product.findAll({
                order: [[criteria, order]],
            });
            console.log('Produits triés :', products);
        } catch (error) {
            console.error('Erreur lors du tri des produits :', error);
        }
    },

    // Rechercher un produit
    searchProduct: async (searchTerm) => {
        try {
            const products = await Product.findAll({
                where: {
                    name: {
                        [Op.like]: `%${searchTerm}%`,
                    },
                },
            });
            console.log('Produits trouvés :', products);
        } catch (error) {
            console.error('Erreur lors de la recherche de produits :', error);
        }
    },

    // Ajouter un produit à la liste de souhaits
    addToWishlist: async (userId, productId) => {
        // Délègue au vrai contrôleur wishlist
        return wishlistController.addToWishlist(userId, productId);
    },

    // Liker et partager un produit
    likeAndShareProduct: async (productId, userId) => {
        try {
            console.log(`Produit ${productId} liké et partagé par l’utilisateur ${userId}.`);
        } catch (error) {
            console.error('Erreur lors du like et du partage du produit :', error);
        }
    },

    // Liste paginée, triée, filtrée, recherche produits
    getProducts: async (req, res) => {
        try {
            const { page = 1, limit = 5, orderBy = 'name', orderDir = 'ASC', search = '', categoryId } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            if (search && search.trim() !== '') {
                where[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ];
            }
            if (categoryId) {
                where.categoryId = categoryId;
            }
            const { count, rows } = await Product.findAndCountAll({
                where,
                order: [[orderBy, orderDir]],
                offset,
                limit: parseInt(limit)
            });
            res.json({ products: rows, total: count });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // Récupérer un produit par ID (public)
    getProductById: async (req, res) => {
        try {
            const id = req.params.id;
            const product = await Product.findByPk(id);
            if (!product) return res.status(404).json({ message: 'Produit introuvable.' });
            let prod = product.toJSON();
            // Correction galleryImages : toujours un tableau
            if (typeof prod.galleryImages === 'string') {
                try {
                    prod.galleryImages = JSON.parse(prod.galleryImages);
                } catch {
                    prod.galleryImages = [];
                }
            } else if (!Array.isArray(prod.galleryImages)) {
                prod.galleryImages = [];
            }
            res.json({ product: { ...prod, likeCount: prod.likeCount || 0 } });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },
};

module.exports = productController;
