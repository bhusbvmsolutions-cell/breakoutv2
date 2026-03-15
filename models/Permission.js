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
          type: DataTypes.ENUM('view', 'create', 'edit', 'delete', 'manage', 'read', 'update', 'export', 'import'),
          allowNull: false,
        },
        moduleId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'modules',
            key: 'id'
          }
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