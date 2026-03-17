const express = require('express');
const router = express.Router();
const permissionController = require('../../controllers/admin/permissionController');
const { isAuthenticated } = require('../../middlewares/auth');
const { hasPermission } = require('../../middlewares/rbac'); // Make sure this path is correct

// All routes require authentication
router.use(isAuthenticated);

// Permission management routes
router.get('/', 
  hasPermission('permissions', 'view'), // Changed from 'read' to 'view' to match your enum
  permissionController.listPermissions
);

// AJAX routes
router.post('/generate', 
  hasPermission('permissions', 'create'),
  permissionController.generatePermissions
);

router.get('/:id', 
  hasPermission('permissions', 'view'), // Changed from 'read' to 'view'
  permissionController.getPermission
);

router.put('/:id', 
  hasPermission('permissions', 'edit'), // Changed from 'update' to 'edit' to match your enum
  permissionController.updatePermission
);

router.get('/:id/roles', 
  hasPermission('permissions', 'view'), // Changed from 'read' to 'view'
  permissionController.getRolesWithPermission
);

router.post('/refresh', 
  hasPermission('permissions', 'manage'),
  permissionController.refreshPermissions
);

module.exports = router;