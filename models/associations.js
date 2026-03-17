/**
 * Centralized associations file
 * This file handles all model associations after all models are loaded
 */

module.exports = (db) => {
    const { User, Role, Permission, UserRole, RolePermission } = db;
  
    // ==================== User Associations ====================
    
    // User ↔ Role (Many-to-Many through UserRole)
    User.belongsToMany(Role, {
      through: UserRole,
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles'
    });
  
    Role.belongsToMany(User, {
      through: UserRole,
      foreignKey: 'roleId',
      otherKey: 'userId',
      as: 'users'
    });
  
    // ==================== Role Associations ====================
    
    // Role ↔ Permission (Many-to-Many through RolePermission)
    Role.belongsToMany(Permission, {
      through: RolePermission,
      foreignKey: 'roleId',
      otherKey: 'permissionId',
      as: 'permissions'
    });
  
    Permission.belongsToMany(Role, {
      through: RolePermission,
      foreignKey: 'permissionId',
      otherKey: 'roleId',
      as: 'roles'
    });

    // ==================== Self-Referential Associations ====================

    // UserRole - Who assigned the role
    UserRole.belongsTo(User, {
      as: 'assigner',
      foreignKey: 'assignedBy',
      constraints: false // Set to true if you want foreign key constraints
    });

    User.hasMany(UserRole, {
      as: 'assignedRoles',
      foreignKey: 'assignedBy'
    });
  
    // RolePermission - Who granted the permission
    RolePermission.belongsTo(User, {
      as: 'granter',
      foreignKey: 'grantedBy',
      constraints: false
    });
  
    User.hasMany(RolePermission, {
      as: 'grantedPermissions',
      foreignKey: 'grantedBy'
    });
  
    // Role - Who created the role
    Role.belongsTo(User, {
      as: 'creator',
      foreignKey: 'createdBy',
      constraints: false
    });
  
    User.hasMany(Role, {
      as: 'createdRoles',
      foreignKey: 'createdBy'
    });
  
    // ==================== User to UserRole/RolePermission ====================
    
    // Direct associations for easier querying
    User.hasMany(UserRole, {
      foreignKey: 'userId',
      as: 'userRoleAssignments'
    });
  
    UserRole.belongsTo(User, {
      foreignKey: 'userId',
      as: 'user'
    });
  
    // ==================== Role to UserRole/RolePermission ====================
    
    Role.hasMany(UserRole, {
      foreignKey: 'roleId',
      as: 'userAssignments'
    });
  
    UserRole.belongsTo(Role, {
      foreignKey: 'roleId',
      as: 'role'
    });
  
    Role.hasMany(RolePermission, {
      foreignKey: 'roleId',
      as: 'permissionAssignments'
    });
  
    RolePermission.belongsTo(Role, {
      foreignKey: 'roleId',
      as: 'role'
    });
  
    // ==================== Permission to RolePermission ====================
    
    Permission.hasMany(RolePermission, {
      foreignKey: 'permissionId',
      as: 'roleAssignments'
    });
  
    RolePermission.belongsTo(Permission, {
      foreignKey: 'permissionId',
      as: 'permission'
    });
  
    // ==================== Additional Helper Associations ====================
    
    // For getting all permissions of a user through roles
    // This is a convenience association but requires raw query or multiple includes
    // Better to use the existing many-to-many through roles
  
    console.log('✓ All model associations have been established successfully');
  };