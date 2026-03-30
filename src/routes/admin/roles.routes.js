const express = require('express');
const router = express.Router();

const roleController = require('../../controllers/admin/role.controller');
const { isAuthenticated } = require('../../middlewares/auth');
const { hasPermission } = require('../../middlewares/rbac');

router.use(isAuthenticated);

// List roles
router.get('/', hasPermission('roles', 'read'), roleController.listRoles);

// Create role
router.get('/create', hasPermission('roles', 'create'), roleController.createRoleForm);
router.post('/', hasPermission('roles', 'create'), roleController.createRole);

// Permissions for a role (must come before /:id/edit to avoid conflict, but it's fine)
router.get('/:id/permissions', hasPermission('roles', 'read'), roleController.getRolePermissions);
router.post('/:id/permissions', hasPermission('roles', 'update'), roleController.updateRolePermissions);

// Edit role
router.get('/:id/edit', hasPermission('roles', 'update'), roleController.editRoleForm);
router.post('/:id', hasPermission('roles', 'update'), roleController.updateRole);

// Delete role
router.delete('/:id', hasPermission('roles', 'delete'), roleController.deleteRole);

module.exports = router;