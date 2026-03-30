'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizPartyTypeMapping = sequelize.define(
    'VenueFinderQuizPartyTypeMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, references: { model: 'venue_finder_quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
      party_type_id: { type: DataTypes.INTEGER, references: { model: 'venue_party_types', key: 'id' }, onDelete: 'CASCADE' },
    },
    {
      tableName: 'venue_finder_quiz_party_type_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['question_id', 'party_type_id'] }],
    }
  );
  return VenueFinderQuizPartyTypeMapping;
};