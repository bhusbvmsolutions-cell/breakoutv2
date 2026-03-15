const db = require('../../../models');
const { Op } = require('sequelize');
const { autoCreatePermissions, assignAllPermissionsToSuperAdmin, assignDefaultPermissionsToAdmin } = require('../../utils/permissionGenerator');
const { isSuperAdmin, userHasPermission } = require('../../utils/rbacHelper');

const permissionController = {
  // List all permissions
  listPermissions: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const resource = req.query.resource || '';

      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (resource) {
        whereClause.resource = resource;
      }

      const { count, rows: permissions } = await db.Permission.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });

      // Get all unique resources for filter
      const resources = await db.Permission.findAll({
        attributes: ['resource'],
        group: ['resource'],
        order: [['resource', 'ASC']]
      });

      // Group permissions by resource for display
      const allPermissions = await db.Permission.findAll({
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });

      const groupedPermissions = {};
      allPermissions.forEach(perm => {
        if (!groupedPermissions[perm.resource]) {
          groupedPermissions[perm.resource] = [];
        }
        groupedPermissions[perm.resource].push(perm);
      });

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
      const canGeneratePermissions = isSuper || userHasPermission(currentUser, 'permissions', 'create');
      const canUpdatePermissions = isSuper || userHasPermission(currentUser, 'permissions', 'update');
      const canRefreshPermissions = isSuper || userHasPermission(currentUser, 'permissions', 'manage');

      res.render('admin/permissions/index', {
        title: 'Permission Management',
        permissions,
        groupedPermissions,
        resources: resources.map(r => r.resource),
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        search,
        selectedResource: resource,
        success: req.query.success,
        error: req.query.error,
        currentUrl: req.originalUrl,
        user: req.session.user,
        canGeneratePermissions,
        canUpdatePermissions,
        canRefreshPermissions
      });

    } catch (error) {
      console.error('List Permissions Error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load permissions',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  },

  // Auto-generate permissions
  generatePermissions: async (req, res) => {
    try {
      const result = await autoCreatePermissions();

      try {
        const assignResult = await assignAllPermissionsToSuperAdmin();
        result.superAdminAssignments = assignResult.assigned;
        const adminAssignResult = await assignDefaultPermissionsToAdmin();
        result.adminAssignments = adminAssignResult.assigned;
      } catch (assignError) {
        console.warn('Super admin assignment skipped:', assignError.message);
      }
      
      res.json({ 
        success: true, 
        message: `Permissions generated successfully. Created: ${result.created}, Skipped: ${result.skipped}`,
        data: result
      });

    } catch (error) {
      console.error('Generate Permissions Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate permissions' 
      });
    }
  },

  // Get permission details
  getPermission: async (req, res) => {
    try {
      const { id } = req.params;

      const permission = await db.Permission.findByPk(id, {
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'displayName']
        }]
      });

      if (!permission) {
        return res.status(404).json({ 
          success: false, 
          error: 'Permission not found' 
        });
      }

      res.json({ 
        success: true, 
        permission 
      });

    } catch (error) {
      console.error('Get Permission Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get permission' 
      });
    }
  },

  // Update permission (only description can be updated for system permissions)
  updatePermission: async (req, res) => {
    try {
      const { id } = req.params;
      const { description } = req.body;

      const permission = await db.Permission.findByPk(id);

      if (!permission) {
        return res.status(404).json({ 
          success: false, 
          error: 'Permission not found' 
        });
      }

      await permission.update({ description });

      res.json({ 
        success: true, 
        message: 'Permission updated successfully',
        permission 
      });

    } catch (error) {
      console.error('Update Permission Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update permission' 
      });
    }
  },

  // Get roles that have this permission
  getRolesWithPermission: async (req, res) => {
    try {
      const { id } = req.params;

      const permission = await db.Permission.findByPk(id, {
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'displayName', 'level']
        }]
      });

      if (!permission) {
        return res.status(404).json({ 
          success: false, 
          error: 'Permission not found' 
        });
      }

      res.json({ 
        success: true, 
        roles: permission.roles 
      });

    } catch (error) {
      console.error('Get Roles With Permission Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get roles with permission' 
      });
    }
  },

  // Refresh all permissions (regenerate based on models)
  refreshPermissions: async (req, res) => {
    try {
      const result = await autoCreatePermissions();
      
      // Re-assign all permissions to super admin
      const superAdminRole = await db.Role.findOne({ 
        where: { name: 'super_admin' } 
      });

      if (superAdminRole) {
        const allPermissions = await db.Permission.findAll();
        let assigned = 0;

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
                grantedBy: req.session.user.id
              }
            });
            assigned++;
          } catch (error) {
            console.error(`Error assigning permission ${permission.id}:`, error);
          }
        }

        result.superAdminAssignments = assigned;
      }

      try {
        const adminAssignResult = await assignDefaultPermissionsToAdmin();
        result.adminAssignments = adminAssignResult.assigned;
      } catch (assignError) {
        console.warn('Admin assignment skipped:', assignError.message);
      }

      res.json({ 
        success: true, 
        message: 'Permissions refreshed successfully',
        data: result
      });

    } catch (error) {
      console.error('Refresh Permissions Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to refresh permissions' 
      });
    }
  }
};

module.exports = permissionController;
