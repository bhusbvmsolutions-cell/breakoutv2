// models/SiteSettings.js

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SiteSettings = sequelize.define(
    "SiteSettings",
    {
      id: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      siteName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      siteTagline: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      siteDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      siteLogo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      siteFavicon: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      contactEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      contactPhone: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      alternatePhone: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      whatsappNumber: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      facebookUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      twitterUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      instagramUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      linkedinUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      youtubeUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      maintenanceMode: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 0,
      },
      maintenanceMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      isActive: {
        type: DataTypes.TINYINT(1),
        allowNull: true,
        defaultValue: 1,
      },
    },
    {
      tableName: "site_settings",
      timestamps: true,
    }
  );

  return SiteSettings;
};
