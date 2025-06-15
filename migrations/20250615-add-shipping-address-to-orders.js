// Migration : Ajoute les champs d'adresse de livraison à Orders
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'shippingAddress', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Adresse complète de livraison (rue, code postal, localité, pays)'
    });
    await queryInterface.addColumn('Orders', 'shippingPostalCode', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Code postal de livraison'
    });
    await queryInterface.addColumn('Orders', 'shippingCity', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Ville/localité de livraison'
    });
    await queryInterface.addColumn('Orders', 'shippingCountry', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Pays de livraison'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'shippingAddress');
    await queryInterface.removeColumn('Orders', 'shippingPostalCode');
    await queryInterface.removeColumn('Orders', 'shippingCity');
    await queryInterface.removeColumn('Orders', 'shippingCountry');
  }
};
