"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("OrderItems", "discountPercent", {
      type: Sequelize.FLOAT,
      allowNull: true,
      comment: "Pourcentage de remise appliqué sur la ligne (si applicable)",
    });
    await queryInterface.addColumn("OrderItems", "unitPriceDiscounted", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: "Prix unitaire après remise (pour affichage)",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("OrderItems", "discountPercent");
    await queryInterface.removeColumn("OrderItems", "unitPriceDiscounted");
  },
};
