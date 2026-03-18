'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('blog_blocks', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      blogId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'blogs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('paragraph', 'heading', 'image', 'quote', 'code', 'hero', 'text', 'gallery', 'cards', 'faq', 'locations', 'cta')
      },
      title: {
        type: Sequelize.STRING(255)
      },
      subtitle: {
        type: Sequelize.STRING(255)
      },
      content: {
        type: Sequelize.TEXT('long')
      },
      settings: {
        type: Sequelize.JSON
      },
      sortOrder: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('blog_blocks');
  }
};
