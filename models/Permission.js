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
        resource: {
          type: DataTypes.STRING(50),
          allowNull: false,
          comment: 'e.g., users, products, orders, roles'
        },
        action: {
          type: DataTypes.ENUM('create', 'read', 'update', 'delete', 'manage', 'export', 'import'),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        isSystem: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          comment: 'System permissions cannot be deleted'
        }
      },
      {
        tableName: "permissions",
        timestamps: true,
      }
    );
  
    return Permission;
  };