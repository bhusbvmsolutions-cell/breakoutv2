'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('virtual_archive_icon_items', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      archive_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'virtual_archives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sort_order: {
        type: Sequelize.INTEGER
      },
      heading: {
        type: Sequelize.STRING(255)
      },
      image: {
        type: Sequelize.STRING(500)
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
    await queryInterface.dropTable('virtual_archive_icon_items');
  }
};
