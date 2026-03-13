const express = require('express');
const router = express.Router();
const permissionController = require('../../controllers/admin/permissionController');
const { isAuthenticated } = require('../../middlewares/auth');
const { hasPermission } = require('../../middlewares/rbac');

// All routes require authentication
router.use(isAuthenticated);

// Permission management routes
router.get('/', 
  hasPermission('permissions', 'read'),
  permissionController.listPermissions
);

// AJAX routes
router.post('/generate', 
  hasPermission('permissions', 'create'),
  permissionController.generatePermissions
);

router.get('/:id', 
  hasPermission('permissions', 'read'),
  permissionController.getPermission
);

router.put('/:id', 
  hasPermission('permissions', 'update'),
  permissionController.updatePermission
);

router.get('/:id/roles', 
  hasPermission('permissions', 'read'),
  permissionController.getRolesWithPermission
);

router.post('/refresh', 
  hasPermission('permissions', 'manage'),
  permissionController.refreshPermissions
);

module.exports = router;