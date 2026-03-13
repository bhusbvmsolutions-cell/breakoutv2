const db = require('../../../models');
const { Op } = require('sequelize');
const {
  getHighestRoleLevel,
  isSuperAdmin,
  userHasPermission,
  normalizeIdArray
} = require('../../utils/rbacHelper');

const roleController = {
  // List all roles
  listRoles: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { displayName: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: roles } = await db.Role.findAndCountAll({
        where: whereClause,
        include: [{
          model: db.User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        limit,
        offset,
        order: [['level', 'DESC']]
      });

      const roleIds = roles.map(role => role.id);
      const roleUserCounts = roleIds.length > 0
        ? await db.UserRole.findAll({
            attributes: [
              'roleId',
              [db.Sequelize.fn('COUNT', db.Sequelize.col('userId')), 'userCount']
            ],
            where: { roleId: roleIds },
            group: ['roleId']
          })
        : [];

      const roleUserCountMap = roleUserCounts.reduce((map, row) => {
        const roleId = row.get('roleId');
        map[roleId] = parseInt(row.get('userCount'), 10);
        return map;
      }, {});

      // Get all permissions for the permission modal
      const allPermissions = await db.Permission.findAll({
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });

      // Group permissions by resource
      const groupedPermissions = {};
      allPermissions.forEach(perm => {
        if (!groupedPermissions[perm.resource]) {
          groupedPermissions[perm.resource] = [];
        }
        groupedPermissions[perm.resource].push(perm);
      });

      // Get current user's role and permission info
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{
          model: db.Role,
          as: 'roles',
          include: [{
            model: db.Permission,
            as: 'permissions',
            through: { attributes: [] }
          }]
        }]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const canCreateRole = isSuper || userHasPermission(currentUser, 'roles', 'create');
      const canUpdateRole = isSuper || userHasPermission(currentUser, 'roles', 'update');
      const canDeleteRole = isSuper || userHasPermission(currentUser, 'roles', 'delete');

      // Add canManage flag to each role
      const rolesWithManage = roles.map(role => {
        const roleJson = role.toJSON();
        roleJson.canManage = canUpdateRole && (isSuper || currentUserLevel > role.level);
        roleJson.canDelete = canDeleteRole && roleJson.canManage && !role.isSystem;
        roleJson.userCount = roleUserCountMap[role.id] || 0;
        return roleJson;
      });

      res.render('admin/roles/index', {
        title: 'Role Management',
        roles: rolesWithManage,
        groupedPermissions,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        search,
        success: req.query.success,
        error: req.query.error,
        currentUrl: req.originalUrl,
        user: req.session.user,
        canCreateRole
      });

    } catch (error) {
      console.error('List Roles Error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load roles',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  },

  // Show create role form
  createRoleForm: async (req, res) => {
    try {
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const maxAssignableLevel = isSuper ? 999 : Math.max(currentUserLevel - 1, 1);

      const permissions = await db.Permission.findAll({
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });

      // Group permissions by resource
      const groupedPermissions = {};
      permissions.forEach(perm => {
        if (!groupedPermissions[perm.resource]) {
          groupedPermissions[perm.resource] = [];
        }
        groupedPermissions[perm.resource].push(perm);
      });

      res.render('admin/roles/create', {
        title: 'Create Role',
        groupedPermissions,
        maxAssignableLevel,
        user: req.session.user
      });
    } catch (error) {
      console.error('Create Role Form Error:', error);
      res.redirect('/admin/roles');
    }
  },

  // Create new role
  createRole: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { name, displayName, description, level, permissionIds } = req.body;
      const parsedLevel = parseInt(level, 10);

      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const maxAssignableLevel = isSuper ? 999 : Math.max(currentUserLevel - 1, 1);

      if (!Number.isInteger(parsedLevel)) {
        await transaction.rollback();
        return res.redirect('/admin/roles?error=Invalid role level');
      }

      if (!isSuper && parsedLevel >= currentUserLevel) {
        await transaction.rollback();
        const permissions = await db.Permission.findAll();
        const groupedPermissions = {};
        permissions.forEach(perm => {
          if (!groupedPermissions[perm.resource]) {
            groupedPermissions[perm.resource] = [];
          }
          groupedPermissions[perm.resource].push(perm);
        });

        return res.render('admin/roles/create', {
          title: 'Create Role',
          error: 'Role level must be lower than your highest role level',
          groupedPermissions,
          formData: req.body,
          maxAssignableLevel,
          user: req.session.user
        });
      }

      // Check if role exists
      const existingRole = await db.Role.findOne({
        where: {
          [Op.or]: [
            { name },
            { displayName }
          ]
        }
      });

      if (existingRole) {
        await transaction.rollback();
        
        const permissions = await db.Permission.findAll();
        const groupedPermissions = {};
        permissions.forEach(perm => {
          if (!groupedPermissions[perm.resource]) {
            groupedPermissions[perm.resource] = [];
          }
          groupedPermissions[perm.resource].push(perm);
        });

        return res.render('admin/roles/create', {
          title: 'Create Role',
          error: 'Role with this name or display name already exists',
          groupedPermissions,
          formData: req.body,
          maxAssignableLevel,
          user: req.session.user
        });
      }

      // Create role
      const newRole = await db.Role.create({
        name,
        displayName,
        description,
        level: parsedLevel,
        isSystem: false,
        createdBy: req.session.user.id
      }, { transaction });

      // Assign permissions if provided
      const permIdArray = normalizeIdArray(permissionIds);
      if (permIdArray.length > 0) {
        const permissionAssignments = permIdArray.map(permId => ({
          roleId: newRole.id,
          permissionId: permId,
          grantedBy: req.session.user.id
        }));

        await db.RolePermission.bulkCreate(permissionAssignments, { transaction });
      }

      await transaction.commit();

      res.redirect('/admin/roles?success=Role created successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('Create Role Error:', error);
      
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const maxAssignableLevel = isSuper ? 999 : Math.max(currentUserLevel - 1, 1);

      const permissions = await db.Permission.findAll();
      const groupedPermissions = {};
      permissions.forEach(perm => {
        if (!groupedPermissions[perm.resource]) {
          groupedPermissions[perm.resource] = [];
        }
        groupedPermissions[perm.resource].push(perm);
      });

      res.render('admin/roles/create', {
        title: 'Create Role',
        error: 'Failed to create role: ' + error.message,
        groupedPermissions,
        formData: req.body,
        maxAssignableLevel,
        user: req.session.user
      });
    }
  },

  // Show edit role form
  editRoleForm: async (req, res) => {
    try {
      const { id } = req.params;

      const role = await db.Role.findByPk(id, {
        include: [{
          model: db.Permission,
          as: 'permissions',
          through: { attributes: [] }
        }]
      });

      if (!role) {
        return res.redirect('/admin/roles?error=Role not found');
      }

      // Check if current user can manage this role
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const maxAssignableLevel = isSuper ? 999 : Math.max(currentUserLevel - 1, 1);

      if (!isSuper && currentUserLevel <= role.level) {
        return res.redirect('/admin/roles?error=You cannot edit this role');
      }

      const permissions = await db.Permission.findAll({
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });

      // Group permissions by resource
      const groupedPermissions = {};
      permissions.forEach(perm => {
        if (!groupedPermissions[perm.resource]) {
          groupedPermissions[perm.resource] = [];
        }
        groupedPermissions[perm.resource].push(perm);
      });

      const rolePermissions = role.permissions.map(p => p.id);

      res.render('admin/roles/edit', {
        title: 'Edit Role',
        role: role.toJSON(),
        groupedPermissions,
        rolePermissions,
        maxAssignableLevel,
        error: req.query.error,
        user: req.session.user
      });

    } catch (error) {
      console.error('Edit Role Form Error:', error);
      res.redirect('/admin/roles');
    }
  },

  // Update role
  updateRole: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { name, displayName, description, level, permissionIds } = req.body;
      const parsedLevel = parseInt(level, 10);
      const requestedPermissionIds = normalizeIdArray(permissionIds);

      const role = await db.Role.findByPk(id);

      if (!role) {
        await transaction.rollback();
        return res.redirect('/admin/roles?error=Role not found');
      }

      // Check if system role
      if (role.isSystem) {
        await transaction.rollback();
        return res.redirect('/admin/roles?error=System roles cannot be modified');
      }

      // Check if current user can manage this role
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);

      if (!isSuper && currentUserLevel <= role.level) {
        await transaction.rollback();
        return res.redirect('/admin/roles?error=You cannot edit this role');
      }

      if (!Number.isInteger(parsedLevel)) {
        await transaction.rollback();
        return res.redirect(`/admin/roles/${id}/edit?error=Invalid role level`);
      }

      if (!isSuper && parsedLevel >= currentUserLevel) {
        await transaction.rollback();
        return res.redirect(`/admin/roles/${id}/edit?error=Role level must be lower than your highest role level`);
      }

      // Update role
      await role.update({
        name,
        displayName,
        description,
        level: parsedLevel
      }, { transaction });

      // Update permissions
      await db.RolePermission.destroy({
        where: { roleId: id },
        transaction
      });

      if (requestedPermissionIds.length > 0) {
        const permissionAssignments = requestedPermissionIds.map(permissionId => ({
          roleId: id,
          permissionId,
          grantedBy: req.session.user.id
        }));

        await db.RolePermission.bulkCreate(permissionAssignments, { transaction });
      }

      await transaction.commit();

      res.redirect('/admin/roles?success=Role updated successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('Update Role Error:', error);
      res.redirect(`/admin/roles/${req.params.id}/edit?error=Failed to update role`);
    }
  },

  // Delete role
  deleteRole: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;

      const role = await db.Role.findByPk(id);

      if (!role) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          error: 'Role not found' 
        });
      }

      // Prevent deletion of system roles
      if (role.isSystem) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          error: 'System roles cannot be deleted' 
        });
      }

      // Check if current user can manage this role
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);

      if (!isSuper && currentUserLevel <= role.level) {
        await transaction.rollback();
        return res.status(403).json({ 
          success: false, 
          error: 'You cannot delete this role' 
        });
      }

      // Check if role is assigned to any users
      const userCount = await db.UserRole.count({
        where: { roleId: id }
      });

      if (userCount > 0) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot delete role that is assigned to users' 
        });
      }

      // Delete role permissions first
      await db.RolePermission.destroy({
        where: { roleId: id },
        transaction
      });

      // Delete role
      await role.destroy({ transaction });

      await transaction.commit();

      res.json({ 
        success: true, 
        message: 'Role deleted successfully' 
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Delete Role Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete role' 
      });
    }
  },

  // Get role permissions (AJAX)
  getRolePermissions: async (req, res) => {
    try {
      const { id } = req.params;

      const role = await db.Role.findByPk(id, {
        include: [{
          model: db.Permission,
          as: 'permissions',
          through: { attributes: [] },
          attributes: ['id', 'name', 'resource', 'action']
        }]
      });

      if (!role) {
        return res.status(404).json({ 
          success: false, 
          error: 'Role not found' 
        });
      }

      res.json({ 
        success: true, 
        permissions: role.permissions 
      });

    } catch (error) {
      console.error('Get Role Permissions Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get role permissions' 
      });
    }
  },

  // Update role permissions (AJAX)
  updateRolePermissions: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;
      const requestedPermissionIds = normalizeIdArray(permissionIds);

      const role = await db.Role.findByPk(id);

      if (!role) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          error: 'Role not found' 
        });
      }

      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);

      if (!isSuper && currentUserLevel <= role.level) {
        await transaction.rollback();
        return res.status(403).json({ 
          success: false, 
          error: 'You cannot manage permissions for this role' 
        });
      }

      // Remove existing permissions
      await db.RolePermission.destroy({
        where: { roleId: id },
        transaction
      });

      // Add new permissions
      if (requestedPermissionIds.length > 0) {
        const permissionAssignments = requestedPermissionIds.map(permissionId => ({
          roleId: id,
          permissionId,
          grantedBy: req.session.user.id
        }));

        await db.RolePermission.bulkCreate(permissionAssignments, { transaction });
      }

      await transaction.commit();

      res.json({ 
        success: true, 
        message: 'Role permissions updated successfully' 
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Update Role Permissions Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update role permissions' 
      });
    }
  }
};

module.exports = roleController;
