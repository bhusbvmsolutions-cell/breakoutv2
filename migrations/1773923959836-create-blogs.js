'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('blogs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        unique: true
      },
      excerpt: {
        type: Sequelize.TEXT
      },
      heroImage: {
        type: Sequelize.STRING(255)
      },
      author: {
        type: Sequelize.STRING(255)
      },
      readTime: {
        type: Sequelize.INTEGER
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },
      locations: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },
      looking_for: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },
      status: {
        type: Sequelize.ENUM('draft', 'published'),
        defaultValue: 'draft'
      },
      publishedAt: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('blogs');
  }
};
