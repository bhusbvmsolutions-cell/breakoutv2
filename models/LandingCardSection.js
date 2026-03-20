'use strict';

module.exports = (sequelize, DataTypes) => {
  const LandingCardSection = sequelize.define(
    "LandingCardSection",
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
        type: DataTypes.STRING(255),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      content: {
        type: DataTypes.TEXT,
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
      tableName: "landing_card_sections",
      timestamps: true
    }
  );

  return LandingCardSection;
};