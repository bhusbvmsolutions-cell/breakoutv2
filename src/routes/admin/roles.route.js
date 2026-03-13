const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/admin/roleController');
const { isAuthenticated } = require('../../middlewares/auth');
const { hasPermission } = require('../../middlewares/rbac');

// All routes require authentication
router.use(isAuthenticated);

// Role management routes
router.get('/', 
  hasPermission('roles', 'read'),
  roleController.listRoles
);

router.get('/create', 
  hasPermission('roles', 'create'),
  roleController.createRoleForm
);

router.post('/', 
  hasPermission('roles', 'create'),
  roleController.createRole
);

router.get('/:id/edit', 
  hasPermission('roles', 'update'),
  roleController.editRoleForm
);

router.post('/:id', 
  hasPermission('roles', 'update'),
  roleController.updateRole
);

router.delete('/:id', 
  hasPermission('roles', 'delete'),
  roleController.deleteRole
);

// AJAX routes
router.get('/:id/permissions', 
  hasPermission('roles', 'read'),
  roleController.getRolePermissions
);

router.post('/:id/permissions', 
  hasPermission('roles', 'update'),
  roleController.updateRolePermissions
);

module.exports = router;