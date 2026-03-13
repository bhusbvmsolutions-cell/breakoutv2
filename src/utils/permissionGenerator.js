const db = require('../../models');

// List of all models/resources that need permissions
const RESOURCES = [
  'users',
  'roles', 
  'permissions',
  'products',
  'orders',
  'categories',
  'settings',
  'dashboard'
];

const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'];

/**
 * Generate all possible permissions based on resources and actions
 */
const generateAllPermissions = () => {
  const permissions = [];
  
  RESOURCES.forEach(resource => {
    ACTIONS.forEach(action => {
      // Skip invalid combinations
      if (resource === 'dashboard' && !['read', 'manage'].includes(action)) return;
      if (resource === 'settings' && !['read', 'update', 'manage'].includes(action)) return;
      
      permissions.push({
        name: `${action}_${resource}`,
        resource,
        action,
        description: `Can ${action} ${resource}`,
        isSystem: true
      });
    });
  });

  // Add special permissions
  permissions.push({
    name: 'manage_all',
    resource: 'system',
    action: 'manage',
    description: 'Can manage all system resources',
    isSystem: true
  });

  return permissions;
};

/**
 * Auto-create permissions for all models
 * This should be run after migrations and can be called from a seeder or API
 */
const autoCreatePermissions = async () => {
  try {
    const permissions = generateAllPermissions();
    let created = 0;
    let skipped = 0;

    for (const permData of permissions) {
      const [permission, created_] = await db.Permission.findOrCreate({
        where: { 
          resource: permData.resource, 
          action: permData.action 
        },
        defaults: permData
      });
      
      if (created_) {
        created++;
      } else {
        skipped++;
      }
    }

    console.log(`✅ Permissions auto-created: ${created}, skipped: ${skipped}`);
    return { created, skipped };
  } catch (error) {
    console.error('❌ Error auto-creating permissions:', error);
    throw error;
  }
};

/**
 * Assign all permissions to super admin role
 */
const assignAllPermissionsToSuperAdmin = async () => {
  try {
    // Find super admin role
    const superAdminRole = await db.Role.findOne({ 
      where: { name: 'super_admin' } 
    });

    if (!superAdminRole) {
      throw new Error('Super admin role not found');
    }

    // Get all permissions
    const allPermissions = await db.Permission.findAll();

    // Assign each permission to super admin
    let assigned = 0;
    let skipped = 0;

    for (const permission of allPermissions) {
      try {
        await db.RolePermission.findOrCreate({
          where: {
            roleId: superAdminRole.id,
            permissionId: permission.id
          },
          defaults: {
            roleId: superAdminRole.id,
            permissionId: permission.id,
            grantedBy: null
          }
        });
        assigned++;
      } catch (error) {
        if (error.name !== 'SequelizeUniqueConstraintError') {
          console.error(`Error assigning permission ${permission.id}:`, error);
        }
        skipped++;
      }
    }

    console.log(`✅ Permissions assigned to super admin: ${assigned}, skipped: ${skipped}`);
    return { assigned, skipped };
  } catch (error) {
    console.error('❌ Error assigning permissions to super admin:', error);
    throw error;
  }
};

module.exports = {
  generateAllPermissions,
  autoCreatePermissions,
  assignAllPermissionsToSuperAdmin,
  RESOURCES,
  ACTIONS
};