'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('escape_room_pricing_cards', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      escape_room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'escape_rooms',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day_range: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      price_2_3_players: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      price_4_6_players: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('escape_room_pricing_cards');
  }
};
