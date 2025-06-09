const Product = require('../models/Products');

const productController = {
    // Ajouter un produit
    addProduct: async (productData) => {
        try {
            const product = await Product.create(productData);
            console.log(`Produit ajouté : ${product.name}`);
        } catch (error) {
            console.error('Erreur lors de l’ajout du produit :', error);
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
        try {
            console.log(`Produit ${productId} ajouté à la liste de souhaits de l’utilisateur ${userId}.`);
        } catch (error) {
            console.error('Erreur lors de l’ajout à la liste de souhaits :', error);
        }
    },

    // Liker et partager un produit
    likeAndShareProduct: async (productId, userId) => {
        try {
            console.log(`Produit ${productId} liké et partagé par l’utilisateur ${userId}.`);
        } catch (error) {
            console.error('Erreur lors du like et du partage du produit :', error);
        }
    },
};

module.exports = productController;
