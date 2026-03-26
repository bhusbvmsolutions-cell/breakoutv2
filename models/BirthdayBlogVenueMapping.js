'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayBlogVenueMapping = sequelize.define(
    'BirthdayBlogVenueMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      blog_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_blogs', key: 'id' },
        onDelete: 'CASCADE',
      },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: { type: DataTypes.STRING, allowNull: false },
      sort_order: DataTypes.INTEGER,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'birthday_blog_venue_mappings',
      timestamps: true,
      indexes: [{ unique: true, fields: ['blog_id', 'venue_id', 'title'] }],
    }
  );
  return BirthdayBlogVenueMapping;
};