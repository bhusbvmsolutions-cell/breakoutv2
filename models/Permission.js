module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define(
      "Permission",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: true
          }
        },
        module: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: false,
          validate: {
            notEmpty: true
          }
        },
        action: {
          type: DataTypes.ENUM('view', 'create', 'edit', 'delete', 'manage', 'read', 'update', 'export', 'import'),
          allowNull: false,
          unique: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        }
      },
      {
        tableName: "permissions",
        timestamps: true,
      }
    );
  
    return Permission;
  };