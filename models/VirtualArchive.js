// models/VirtualArchive.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchive = sequelize.define(
    'VirtualArchive',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      // Banner section
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.TEXT,
      banner_video_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'videos', key: 'id' }
      },
      // Content section
      content_section_content: DataTypes.TEXT,
      content_section_note: DataTypes.STRING,
      // Counter section
      counters_heading: DataTypes.STRING,
      counters_counter_heading: DataTypes.STRING,
      counters_counter_rating: DataTypes.DECIMAL(3,1),
      // Icons section heading
      icons_heading: DataTypes.STRING,
      // Add‑ons section heading
      addons_heading: DataTypes.STRING,
      // Package section heading
      packages_heading: DataTypes.STRING,
      // Footer section
      footer_heading: DataTypes.STRING,
      footer_description1: DataTypes.TEXT,
      footer_description2: DataTypes.TEXT,
      // Timestamps
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    { tableName: 'virtual_archives' }
  );
  return VirtualArchive;
};