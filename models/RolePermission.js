module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define(
    "RolePermission",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: false,
        references: {
          model: 'permissions',
          key: 'id'
        }
      },
      grantedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      tableName: "role_permissions",
      timestamps: true,
    }
  );

  return RolePermission;
};