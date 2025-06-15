// 20250615-add-totalTTC-to-orders.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'totalTTC', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Montant total TTC payé pour la commande',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Orders', 'totalTTC');
  }
};
