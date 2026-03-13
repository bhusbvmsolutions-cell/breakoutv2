const db = require('../../../models');
const { Op } = require('sequelize');
const {
  getHighestRoleLevel,
  isSuperAdmin,
  userHasPermission,
  normalizeIdArray,
  filterAssignableRoles
} = require('../../utils/rbacHelper');

const userController = {
  // List all users with pagination and filters
  listUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: users } = await db.User.findAndCountAll({
        where: whereClause,
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] },
          attributes: ['id', 'name', 'displayName', 'level']
        }],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires', 'emailVerificationToken'] },
        distinct: true
      });

      // Get all roles for the assign role modal
      const allRoles = await db.Role.findAll({
        order: [['level', 'DESC']]
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
      const canCreateUser = isSuper || userHasPermission(currentUser, 'users', 'create');
      const canUpdateUser = isSuper || userHasPermission(currentUser, 'users', 'update');
      const canDeleteUser = isSuper || userHasPermission(currentUser, 'users', 'delete');

      const assignableRoles = filterAssignableRoles(allRoles, currentUserLevel, isSuper);

      // Add canManage flag to each user
      const usersWithManage = users.map(user => {
        const userJson = user.toJSON();
        const userMaxLevel = getHighestRoleLevel(user.roles);
        userJson.canManage = canUpdateUser && (isSuper || currentUserLevel > userMaxLevel);
        userJson.canDelete = canDeleteUser && userJson.canManage && user.id !== req.session.user.id; // Can't delete self
        return userJson;
      });

      res.render('admin/users/index', {
        title: 'User Management',
        users: usersWithManage,
        allRoles: assignableRoles,
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
        canCreateUser
      });

    } catch (error) {
      console.error('List Users Error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load users',
        error: process.env.NODE_ENV === 'development' ? error : {}
      });
    }
  },

  // Show create user form
  createUserForm: async (req, res) => {
    try {
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);

      const roles = await db.Role.findAll({
        order: [['level', 'DESC']]
      });

      const assignableRoles = filterAssignableRoles(roles, currentUserLevel, isSuper);
      const viewerRole = assignableRoles.find(role => role.name === 'viewer');
      const selectedRoleIds = viewerRole ? [viewerRole.id.toString()] : [];

      res.render('admin/users/create', {
        title: 'Create User',
        roles: assignableRoles,
        selectedRoleIds,
        formData: {},
        user: req.session.user
      });
    } catch (error) {
      console.error('Create User Form Error:', error);
      res.redirect('/admin/users');
    }
  },

  // Create new user
  createUser: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { firstName, lastName, username, email, password, phone, roleIds } = req.body;
      const normalizedEmail = (email || '').trim();
      const normalizedUsername = (username || '').trim() || normalizedEmail;

      const requestedRoleIds = normalizeIdArray(roleIds);

      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);

      const roles = await db.Role.findAll({
        order: [['level', 'DESC']]
      });

      const assignableRoles = filterAssignableRoles(roles, currentUserLevel, isSuper);
      const assignableRoleIds = new Set(assignableRoles.map(role => role.id));

      if (!isSuper && requestedRoleIds.some(roleId => !assignableRoleIds.has(roleId))) {
        await transaction.rollback();
        return res.render('admin/users/create', {
          title: 'Create User',
          error: 'You cannot assign roles higher than your own level',
          roles: assignableRoles,
          formData: { ...req.body, username: (username || '').trim() },
          selectedRoleIds: requestedRoleIds.map(id => id.toString()),
          user: req.session.user
        });
      }

      if (isSuper && requestedRoleIds.length > 0) {
        const roleCount = await db.Role.count({
          where: { id: requestedRoleIds }
        });

        if (roleCount !== new Set(requestedRoleIds).size) {
          await transaction.rollback();
          return res.render('admin/users/create', {
            title: 'Create User',
            error: 'One or more selected roles do not exist',
            roles: assignableRoles,
            formData: { ...req.body, username: (username || '').trim() },
            selectedRoleIds: requestedRoleIds.map(id => id.toString()),
            user: req.session.user
          });
        }
      }

      // Check if user exists
      const existingUser = await db.User.findOne({
        where: {
          [Op.or]: [
            { email: normalizedEmail },
            { username: normalizedUsername }
          ]
        }
      });

      if (existingUser) {
        await transaction.rollback();
        return res.render('admin/users/create', {
          title: 'Create User',
          error: 'User with this email or username already exists',
          roles: assignableRoles,
          formData: { ...req.body, username: (username || '').trim() },
          selectedRoleIds: requestedRoleIds.map(id => id.toString()),
          user: req.session.user
        });
      }

      // Create user
      const newUser = await db.User.create({
        firstName,
        lastName,
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        phone,
        isActive: true,
        isEmailVerified: false,
        role: 'viewer' // Default role
      }, { transaction });

      // Assign roles if provided
      if (requestedRoleIds.length > 0) {
        const roleAssignments = requestedRoleIds.map(roleId => ({
          userId: newUser.id,
          roleId,
          assignedBy: req.session.user.id
        }));

        await db.UserRole.bulkCreate(roleAssignments, { transaction });
      }

      await transaction.commit();

      res.redirect('/admin/users?success=User created successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('Create User Error:', error);
      
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const roles = await db.Role.findAll({
        order: [['level', 'DESC']]
      });
      const assignableRoles = filterAssignableRoles(roles, currentUserLevel, isSuper);
      const selectedRoleIds = normalizeIdArray(req.body.roleIds).map(id => id.toString());

      res.render('admin/users/create', {
        title: 'Create User',
        error: 'Failed to create user: ' + error.message,
        roles: assignableRoles,
        formData: { ...req.body, username: (req.body.username || '').trim() },
        selectedRoleIds,
        user: req.session.user
      });
    }
  },

  // Show edit user form
  editUserForm: async (req, res) => {
    try {
      const { id } = req.params;

      const editUser = await db.User.findByPk(id, {
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      if (!editUser) {
        return res.redirect('/admin/users?error=User not found');
      }

      // Check if current user can manage this user
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const targetUserLevel = getHighestRoleLevel(editUser?.roles);

      if (!isSuper && currentUserLevel <= targetUserLevel) {
        return res.redirect('/admin/users?error=You cannot edit this user');
      }

      const allRoles = await db.Role.findAll({
        order: [['level', 'DESC']]
      });

      const assignableRoles = filterAssignableRoles(allRoles, currentUserLevel, isSuper);

      res.render('admin/users/edit', {
        title: 'Edit User',
        editUser: editUser.toJSON(),
        allRoles: assignableRoles,
        userRoles: editUser.roles.map(r => r.id),
        error: req.query.error,
        currentUrl: req.originalUrl,
        user: req.session.user
      });

    } catch (error) {
      console.error('Edit User Form Error:', error);
      res.redirect('/admin/users');
    }
  },

  // Update user
  updateUser: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { firstName, lastName, username, phone, isActive, roleIds } = req.body;
      const normalizedUsername = (username || '').trim();
      const requestedRoleIds = normalizeIdArray(roleIds);

      const user = await db.User.findByPk(id, {
        include: [{ model: db.Role, as: 'roles' }]
      });

      if (!user) {
        await transaction.rollback();
        return res.redirect('/admin/users?error=User not found');
      }

      // Check if current user can manage this user
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const targetUserLevel = getHighestRoleLevel(user?.roles);

      if (!isSuper && currentUserLevel <= targetUserLevel) {
        await transaction.rollback();
        return res.redirect('/admin/users?error=You cannot edit this user');
      }

      if (normalizedUsername) {
        const existingUsername = await db.User.findOne({
          where: {
            username: normalizedUsername,
            id: { [Op.ne]: id }
          }
        });

        if (existingUsername) {
          await transaction.rollback();
          return res.redirect(`/admin/users/${id}/edit?error=Username already in use`);
        }
      }

      if (requestedRoleIds.length > 0) {
        const roles = await db.Role.findAll({
          where: { id: requestedRoleIds },
          attributes: ['id', 'level']
        });

        if (roles.length !== new Set(requestedRoleIds).size) {
          await transaction.rollback();
          return res.redirect(`/admin/users/${id}/edit?error=One or more selected roles do not exist`);
        }

        if (!isSuper && roles.some(role => (role.level || 0) >= currentUserLevel)) {
          await transaction.rollback();
          return res.redirect(`/admin/users/${id}/edit?error=You cannot assign roles higher than your own level`);
        }
      }

      // Update user
      await user.update({
        firstName,
        lastName,
        username: normalizedUsername || null,
        phone,
        isActive: isActive === 'on' || isActive === true
      }, { transaction });

      // Update roles
      await db.UserRole.destroy({
        where: { userId: id },
        transaction
      });

      if (requestedRoleIds.length > 0) {
        const roleAssignments = requestedRoleIds.map(roleId => ({
          userId: id,
          roleId,
          assignedBy: req.session.user.id
        }));

        await db.UserRole.bulkCreate(roleAssignments, { transaction });
      }

      await transaction.commit();

      res.redirect('/admin/users?success=User updated successfully');

    } catch (error) {
      await transaction.rollback();
      console.error('Update User Error:', error);
      res.redirect(`/admin/users/${req.params.id}/edit?error=Failed to update user`);
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (parseInt(id) === req.session.user.id) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false, 
          error: 'You cannot delete your own account' 
        });
      }

      const user = await db.User.findByPk(id, {
        include: [{ model: db.Role, as: 'roles' }]
      });

      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      // Check if current user can manage this user
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });
      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);
      const targetUserLevel = getHighestRoleLevel(user?.roles);

      if (!isSuper && currentUserLevel <= targetUserLevel) {
        await transaction.rollback();
        return res.status(403).json({ 
          success: false, 
          error: 'You cannot delete this user' 
        });
      }

      // Delete user roles first
      await db.UserRole.destroy({
        where: { userId: id },
        transaction
      });

      // Delete user
      await user.destroy({ transaction });

      await transaction.commit();

      res.json({ 
        success: true, 
        message: 'User deleted successfully' 
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Delete User Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete user' 
      });
    }
  },

  // Toggle user active status
  toggleUserStatus: async (req, res) => {
    try {
      const { id } = req.params;

      if (parseInt(id) === req.session.user.id) {
        return res.status(400).json({ 
          success: false, 
          error: 'You cannot change your own status' 
        });
      }

      const user = await db.User.findByPk(id);

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      await user.update({ isActive: !user.isActive });

      res.json({ 
        success: true, 
        isActive: user.isActive,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` 
      });

    } catch (error) {
      console.error('Toggle User Status Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to toggle user status' 
      });
    }
  },

  // Assign roles to user (AJAX)
  assignRoles: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { roleIds } = req.body;
      const requestedRoleIds = normalizeIdArray(roleIds);

      const user = await db.User.findByPk(id);

      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [{ model: db.Role, as: 'roles' }]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentUserLevel = getHighestRoleLevel(currentUser?.roles);

      if (requestedRoleIds.length > 0) {
        const roles = await db.Role.findAll({
          where: { id: requestedRoleIds },
          attributes: ['id', 'level']
        });

        if (roles.length !== new Set(requestedRoleIds).size) {
          await transaction.rollback();
          return res.status(400).json({ 
            success: false, 
            error: 'One or more selected roles do not exist' 
          });
        }

        if (!isSuper && roles.some(role => (role.level || 0) >= currentUserLevel)) {
          await transaction.rollback();
          return res.status(403).json({ 
            success: false, 
            error: 'You cannot assign roles higher than your own level' 
          });
        }
      }

      // Remove existing roles
      await db.UserRole.destroy({
        where: { userId: id },
        transaction
      });

      // Add new roles
      if (requestedRoleIds.length > 0) {
        const roleAssignments = requestedRoleIds.map(roleId => ({
          userId: id,
          roleId,
          assignedBy: req.session.user.id
        }));

        await db.UserRole.bulkCreate(roleAssignments, { transaction });
      }

      await transaction.commit();

      res.json({ 
        success: true, 
        message: 'Roles assigned successfully' 
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Assign Roles Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to assign roles' 
      });
    }
  }
};

module.exports = userController;
