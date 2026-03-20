'use strict';

module.exports = (sequelize, DataTypes) => {
  const LandingCounterCard = sequelize.define(
    "LandingCounterCard",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      landing_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'landing_pages',
          key: 'id'
        }
      },
      image: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      heading: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: null
      },
      count: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "landing_counter_cards",
      timestamps: true
    }
  );

  return LandingCounterCard;
};