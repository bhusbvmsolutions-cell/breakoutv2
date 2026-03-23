'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('party_archives', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      banner_heading: {
        type: Sequelize.STRING(255)
      },
      banner_description: {
        type: Sequelize.TEXT
      },
      banner_birthday_image: {
        type: Sequelize.STRING(500)
      },
      banner_bachelor_image: {
        type: Sequelize.STRING(500)
      },
      banner_farewell_image: {
        type: Sequelize.STRING(500)
      },
      banner_content: {
        type: Sequelize.TEXT
      },
      banner_note: {
        type: Sequelize.STRING(255)
      },
      counters_heading: {
        type: Sequelize.STRING(255)
      },
      counters_rating: {
        type: Sequelize.STRING(500)
      },
      footer_heading: {
        type: Sequelize.STRING(255)
      },
      footer_description1: {
        type: Sequelize.TEXT
      },
      footer_description2: {
        type: Sequelize.TEXT
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('party_archives');
  }
};
