'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('virtual_games', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      banner_heading: {
        type: Sequelize.STRING(255)
      },
      banner_image: {
        type: Sequelize.STRING(500)
      },
      banner_description: {
        type: Sequelize.TEXT
      },
      banner_content: {
        type: Sequelize.TEXT('long')
      },
      success_rate: {
        type: Sequelize.STRING(10)
      },
      capacity: {
        type: Sequelize.STRING(50)
      },
      cta_label: {
        type: Sequelize.STRING(255)
      },
      cta_link: {
        type: Sequelize.STRING(255)
      },
      video_trailer: {
        type: Sequelize.STRING(255)
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
    await queryInterface.dropTable('virtual_games');
  }
};
