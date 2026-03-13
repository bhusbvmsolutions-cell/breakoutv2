module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define(
      "UserRole",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: false,
          references: {
            model: 'users',
            key: 'id'
          }
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
        assignedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          unique: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        assignedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        }
      },
      {
        tableName: "user_roles",
        timestamps: true,
      }
    );
  
    return UserRole;
  };