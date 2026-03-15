require('dotenv').config();

const db = require('../models');
const {
  autoCreatePermissions,
  assignAllPermissionsToSuperAdmin,
  assignDefaultPermissionsToAdmin
} = require('../src/utils/permissionGenerator');

async function main() {
  try {
    await db.sequelize.authenticate();

    const createResult = await autoCreatePermissions();
    console.log('Permission generation:', createResult);

    const superResult = await assignAllPermissionsToSuperAdmin();
    console.log('Super admin assignment:', superResult);

    const adminResult = await assignDefaultPermissionsToAdmin();
    console.log('Admin assignment:', adminResult);
  } finally {
    await db.sequelize.close();
  }
}

main().catch((error) => {
  console.error('Permission sync failed:', error);
  process.exitCode = 1;
});

