const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // 🔹 Basic
      firstName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      // 🔹 Auth
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // 🔹 Role based access - Keeping this for backward compatibility
      role: {
        type: DataTypes.ENUM('admin', 'super_admin', 'editor', 'viewer', 'contributor'),
        defaultValue: 'viewer',
        allowNull: false,
      },

      // 🔹 Account status
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      // 🔹 Forgot password
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // 🔹 Email verify token
      emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // 🔹 Tracking
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      lastPasswordChange: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
            user.lastPasswordChange = new Date();
          }
        }
      }
    }
  );

  // Instance methods
  User.prototype.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
  };

  // These methods will be available after associations are loaded
  // They need to access the models through the db object
  User.prototype.hasPermission = async function(resource, action) {
    const roles = await this.getRoles({
      include: [{
        model: sequelize.models.Permission,
        as: 'permissions',
        through: { attributes: [] }
      }]
    });
    
    for (const role of roles) {
      const permissions = role.permissions || [];
      const hasPermission = permissions.some(p => 
        p.resource === resource && (p.action === action || p.action === 'manage')
      );
      if (hasPermission) return true;
    }
    
    return false;
  };

  User.prototype.hasRole = function(roleNames) {
    if (!this.roles) return false;
    const roles = Array.isArray(roleNames) ? roleNames : [roleNames];
    return this.roles.some(role => roles.includes(role.name));
  };

  User.prototype.getHighestRoleLevel = function() {
    if (!this.roles || this.roles.length === 0) return 0;
    return Math.max(...this.roles.map(role => role.level));
  };

  User.prototype.canManageUser = function(targetUser) {
    const userLevel = this.getHighestRoleLevel();
    const targetLevel = targetUser.getHighestRoleLevel ? targetUser.getHighestRoleLevel() : 0;
    return userLevel > targetLevel;
  };

  return User;
};