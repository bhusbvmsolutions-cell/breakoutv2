const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const { isAuthenticated } = require('../../middlewares/auth');
const { hasPermission, canManageUser } = require('../../middlewares/rbac');

// All routes require authentication
router.use(isAuthenticated);

// User management routes
router.get('/', 
  hasPermission('users', 'read'),
  userController.listUsers
);

router.get('/create', 
  hasPermission('users', 'create'),
  userController.createUserForm
);

router.post('/', 
  hasPermission('users', 'create'),
  userController.createUser
);

router.get('/:id/edit', 
  hasPermission('users', 'update'),
  canManageUser,
  userController.editUserForm
);

router.post('/:id', 
  hasPermission('users', 'update'),
  canManageUser,
  userController.updateUser
);

router.delete('/:id', 
  hasPermission('users', 'delete'),
  canManageUser,
  userController.deleteUser
);

router.post('/:id/toggle-status', 
  hasPermission('users', 'update'),
  canManageUser,
  userController.toggleUserStatus
);

router.post('/:id/assign-roles', 
  hasPermission('users', 'update'),
  canManageUser,
  userController.assignRoles
);

module.exports = router;