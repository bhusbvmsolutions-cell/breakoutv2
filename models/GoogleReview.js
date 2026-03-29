"use strict";

module.exports = (sequelize, DataTypes) => {
  const GoogleReview = sequelize.define(
    "GoogleReview",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: "pages", key: "id" },
        onDelete: "CASCADE",
      },
      reviewer_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      reviewer_image: {
        type: DataTypes.STRING,
        allowNull: false, // profile image URL
      },
      rating: {
        type: DataTypes.INTEGER, // 1 to 5
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      review_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      review_date: {
        type: DataTypes.DATE,
      },
      sort_order: {
        type: DataTypes.INTEGER,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "google_reviews",
      timestamps: true,
    },
  );
  return GoogleReview;
};
