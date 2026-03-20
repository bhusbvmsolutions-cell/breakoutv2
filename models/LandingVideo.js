'use strict';

module.exports = (sequelize, DataTypes) => {
  const LandingVideo = sequelize.define(
    "LandingVideo",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      landing_id: {
        type: DataTypes.INTEGER,
        unique:false,
        allowNull: false,
        references: {
          model: 'landing_pages',
          key: 'id'
        }
      },
      video_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique:false,
        references: {
          model: 'videos',
          key: 'id'
        }
      },
      video_title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique:false,
        comment: "Custom title for this video on this landing page"
      },
      sort_order: {
        type: DataTypes.INTEGER,
        unique:false,
        defaultValue: 0
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "landing_videos",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['landing_id', 'video_id']
        }
      ]
    }
  );

  return LandingVideo;
};