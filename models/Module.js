module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define(
    'Module',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      icon: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      route: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: 'modules',
      timestamps: true,
    }
  );

  return Module;
};