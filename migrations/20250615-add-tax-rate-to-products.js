"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Products", "tax_rate", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 21,
      comment: "Taux de TVA applicable au produit (ex: 6 ou 21)",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Products", "tax_rate");
  },
};
