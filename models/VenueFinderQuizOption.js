'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizOption = sequelize.define(
    'VenueFinderQuizOption',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'venue_finder_quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
      text: { type: DataTypes.STRING(500), allowNull: false },
      order: { type: DataTypes.INTEGER, defaultValue: 0 },
      filter_data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON with filter criteria for this custom option, e.g., { "category_ids": [1,2] }',
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'venue_finder_quiz_options',
      timestamps: true,
    }
  );
  return VenueFinderQuizOption;
};