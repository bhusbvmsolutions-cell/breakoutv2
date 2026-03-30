'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizLocationMapping = sequelize.define(
    'VenueFinderQuizLocationMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, references: { model: 'venue_finder_quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
      location_id: { type: DataTypes.INTEGER, references: { model: 'locations', key: 'id' }, onDelete: 'CASCADE' },
    },
    {
      tableName: 'venue_finder_quiz_location_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['question_id', 'location_id'] }],
    }
  );
  return VenueFinderQuizLocationMapping;
};