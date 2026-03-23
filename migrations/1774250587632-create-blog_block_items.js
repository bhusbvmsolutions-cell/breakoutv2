'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('blog_block_items', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      blockId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'blog_blocks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(255)
      },
      subtitle: {
        type: Sequelize.STRING(255)
      },
      description: {
        type: Sequelize.TEXT
      },
      image: {
        type: Sequelize.STRING(255)
      },
      icon: {
        type: Sequelize.STRING(255)
      },
      link: {
        type: Sequelize.STRING(255)
      },
      extraData: {
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
    await queryInterface.dropTable('blog_block_items');
  }
};
