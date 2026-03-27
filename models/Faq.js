'use strict';
module.exports = (sequelize, DataTypes) => {
  const Faq = sequelize.define(
    'Faq',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      question: { type: DataTypes.TEXT, allowNull: false },
      answer: { type: DataTypes.TEXT, allowNull: false },
      sort_order: DataTypes.INTEGER,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'faqs',
      timestamps: true,
    }
  );
  return Faq;
};