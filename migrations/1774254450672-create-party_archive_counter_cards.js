'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('party_archive_counter_cards', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      archive_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'party_archives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sort_order: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING(500)
      },
      count: {
        type: Sequelize.STRING(50)
      },
      description: {
        type: Sequelize.STRING(255)
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
    await queryInterface.dropTable('party_archive_counter_cards');
  }
};
