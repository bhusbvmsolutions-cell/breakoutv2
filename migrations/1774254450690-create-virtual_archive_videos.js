'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('virtual_archive_videos', {
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
      video_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'videos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      custom_title: {
        type: Sequelize.STRING(255)
      },
      sort_order: {
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
    await queryInterface.dropTable('virtual_archive_videos');
  }
};
