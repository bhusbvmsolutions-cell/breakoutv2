const db = require('../../models');

/**
 * Auto-create permissions based on defined modules and actions
 * This ensures all necessary permissions exist in the database
 */
const autoCreatePermissions = async () => {
  console.log('🔄 Auto-creating permissions...');

  try {
    // Define all modules and their actions
    const permissionDefinitions = [      
      // User management
      { module: 'users', action: 'view', name: 'view_users', description: 'View users' },
      { module: 'users', action: 'create', name: 'create_users', description: 'Create users' },
      { module: 'users', action: 'edit', name: 'edit_users', description: 'Edit users' },
      { module: 'users', action: 'delete', name: 'delete_users', description: 'Delete users' },
      
      // Role management
      { module: 'roles', action: 'view', name: 'view_roles', description: 'View roles' },
      { module: 'roles', action: 'create', name: 'create_roles', description: 'Create roles' },
      { module: 'roles', action: 'edit', name: 'edit_roles', description: 'Edit roles' },
      { module: 'roles', action: 'delete', name: 'delete_roles', description: 'Delete roles' },
    ];

    let created = 0;
    let existing = 0;

    for (const permDef of permissionDefinitions) {
      try {
        // FIXED: Removed 'resource' field that was causing the error
        const [permission, created_new] = await db.Permission.findOrCreate({
          where: { 
            name: permDef.name,
            module: permDef.module,
            action: permDef.action
          },
          defaults: {
            name: permDef.name,
            module: permDef.module,
            action: permDef.action,
            description: permDef.description
          }
        });

        if (created_new) {
          created++;
          console.log(`  ✓ Created permission: ${permDef.name}`);
        } else {
          existing++;
        }
      } catch (err) {
        console.error(`  ✗ Error creating permission ${permDef.name}:`, err.message);
      }
    }

    console.log(`✅ Permission auto-creation complete: ${created} created, ${existing} existing`);
    
  } catch (err) {
    console.error('❌ Error auto-creating permissions:', err);
    throw err;
  }
};

module.exports = autoCreatePermissions;