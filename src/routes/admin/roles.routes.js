const express = require('express');
const router = express.Router();

const roleController = require('../../controllers/admin/role.controller');
const { isAuthenticated } = require('../../middlewares/auth');
const { hasPermission } = require('../../middlewares/rbac');

router.use(isAuthenticated);

router.get(
  '/',
  hasPermission('roles','read'),
  roleController.listRoles
);

router.get(
  '/create',
  hasPermission('roles','create'),
  roleController.createRoleForm
);

router.post(
  '/',
  hasPermission('roles','create'),
  roleController.createRole
);

router.get(
  '/:id/edit',
  hasPermission('roles','update'),
  roleController.editRoleForm
);

router.post(
  '/:id',
  hasPermission('roles','update'),
  roleController.updateRole
);

router.delete(
  '/:id',
  hasPermission('roles','delete'),
  roleController.deleteRole
);

module.exports = router;