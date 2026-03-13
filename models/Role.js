module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define(
      "Role",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true,
            is: /^[a-zA-Z0-9_]+$/
          }
        },
        displayName: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        level: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        isSystem: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        tableName: "roles",
        timestamps: true,
      }
    );
  
    return Role;
  };