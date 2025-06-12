const sequelize = require('../config/database');
const User = require('./Users');
const Product = require('./Products');
const Blog = require('./Blogs');
const Cart = require('./Cart');
const CartLocation = require('./CartLocation');
const Contact = require('./Contact');
const Newsletter = require('./Newsletter');
const Orders = require('./Orders');
const Location = require('./Location');
const Wishlist = require('./Wishlist');
const Cookies = require('./Cookies');
const Messages = require('./Messages');
const Category = require('./Category');
const SpecialOffer = require('./SpecialOffer');

// Associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// Synchronisation des modèles avec la base de données
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Les modèles ont été synchronisés avec la base de données (alter mode).');
        console.log('Modèle Users synchronisé.');
        console.log('Modèle Products synchronisé.');
        console.log('Modèle Blogs synchronisé.');
        console.log('Modèle Cart synchronisé.');
        console.log('Modèle CartLocation synchronisé.');
        console.log('Modèle Contact synchronisé.');
        console.log('Modèle Newsletter synchronisé.');
        console.log('Modèle Orders synchronisé.');
        console.log('Modèle Location synchronisé.');
        console.log('Modèle Wishlist synchronisé.');
        console.log('Modèle Cookies synchronisé.');
        console.log('Modèle Messages synchronisé.');
        console.log('Modèle Category synchronisé.');
        console.log('Modèle SpecialOffer synchronisé.');
    })
    .catch(err => console.error('Erreur lors de la synchronisation des modèles :', err));

module.exports = {
  Blogs: require('./Blogs'),
  Cart: require('./Cart'),
  CartLocation: require('./CartLocation'),
  Contact: require('./Contact'),
  Cookies: require('./Cookies'),
  Location: require('./Location'),
  Messages,
  Newsletter: require('./Newsletter'),
  Orders: require('./Orders'),
  Products: require('./Products'),
  Users: require('./Users'),
  Wishlist: require('./Wishlist'),
  Category: require('./Category'),
  SpecialOffer: require('./SpecialOffer'),
};
