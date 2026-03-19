const db = require("../../../models");
const { Op } = require("sequelize");
const {
  getHighestRoleLevel,
  isSuperAdmin,
  userHasPermission,
  normalizeIdArray,
} = require("../../utils/rbacHelper");

const roleController = {
  /*
  =====================================================
  LIST ROLES
  =====================================================
  */
  listRoles: async (req, res) => {
    try {
      // Debug: Check what's in db
      console.log('Available models:', Object.keys(db));
      console.log('Role exists:', !!db.Role);
      
      // Verify Role model exists and has findAndCountAll
      if (!db.Role) {
        throw new Error('Role model not found in db object');
      }
      
      if (typeof db.Role.findAndCountAll !== 'function') {
        console.error('Role methods:', Object.keys(db.Role));
        throw new Error('Role.findAndCountAll is not a function');
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";

      const where = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { displayName: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await db.Role.findAndCountAll({
        where,
        include: [
          {
            model: db.User,
            as: "creator",
            attributes: ["id", "firstName", "lastName", "email"],
            required: false
          }
        ],
        order: [["level", "DESC"]],
        limit,
        offset,
        distinct: true
      });

      const roleIds = rows.map(r => r.id);

      const userCounts = roleIds.length
        ? await db.UserRole.findAll({
            attributes: [
              "roleId",
              [db.sequelize.fn("COUNT", db.sequelize.col("userId")), "count"]
            ],
            where: { roleId: roleIds },
            group: ["roleId"]
          })
        : [];

      const countMap = {};
      userCounts.forEach(r => {
        countMap[r.get("roleId")] = parseInt(r.get("count"));
      });

      const permissions = await db.Permission.findAll({
        order: [["module", "ASC"], ["action", "ASC"]]
      });

      const groupedPermissions = {};

      permissions.forEach(p => {
        if (!groupedPermissions[p.module]) {
          groupedPermissions[p.module] = [];
        }
        groupedPermissions[p.module].push(p);
      });

      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [
          {
            model: db.Role,
            as: "roles",
            include: [
              {
                model: db.Permission,
                as: "permissions",
                through: { attributes: [] }
              }
            ]
          }
        ]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentLevel = getHighestRoleLevel(currentUser?.roles || []);

      const canCreateRole =
        isSuper || userHasPermission(currentUser, "roles", "create");

      const canUpdateRole =
        isSuper || userHasPermission(currentUser, "roles", "update");

      const canDeleteRole =
        isSuper || userHasPermission(currentUser, "roles", "delete");

      const roles = rows.map(role => {
        const r = role.toJSON();

        r.canManage =
          canUpdateRole &&
          (isSuper || currentLevel > role.level);

        r.canDelete =
          canDeleteRole &&
          r.canManage &&
          !role.isSystem;

        r.userCount = countMap[role.id] || 0;

        return r;
      });

      res.render("admin/roles/index", {
        title: "Role Management",
        roles,
        groupedPermissions,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        search,
        user: req.session.user,
        canCreateRole
      });

    } catch (err) {
      console.error('Error in listRoles:', err);
      req.flash("error", "Failed to load roles: " + err.message);
      res.redirect("/admin/dashboard");
    }
  },

  /*
  =====================================================
  CREATE ROLE FORM
  =====================================================
  */
  createRoleForm: async (req, res) => {
    try {
      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [
          {
            model: db.Role,
            as: "roles",
            include: [
              {
                model: db.Permission,
                as: "permissions",
                through: { attributes: [] }
              }
            ]
          }
        ]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const level = getHighestRoleLevel(currentUser?.roles || []);

      const maxAssignableLevel =
        isSuper ? 999 : Math.max(level - 1, 1);

      const permissions = await db.Permission.findAll({
        order: [["module", "ASC"], ["action", "ASC"]]
      });

      const groupedPermissions = {};

      permissions.forEach(p => {
        if (!groupedPermissions[p.module]) {
          groupedPermissions[p.module] = [];
        }
        groupedPermissions[p.module].push(p);
      });
      formData = {};

      res.render("admin/roles/create", {
        title: "Create Role",
        groupedPermissions,
        maxAssignableLevel,
        formData,
        user: req.session.user
      });

    } catch (err) {
      console.error('Error in createRoleForm:', err);
      req.flash("error", "Failed to load create role form");
      res.redirect("/admin/roles");
    }
  },

  /*
  =====================================================
  CREATE ROLE
  =====================================================
  */
  createRole: async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
      const { name, displayName, description, level, permissionIds } = req.body;

      const parsedLevel = parseInt(level, 10);

      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [
          {
            model: db.Role,
            as: "roles",
            include: [
              {
                model: db.Permission,
                as: "permissions",
                through: { attributes: [] }
              }
            ]
          }
        ]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentLevel = getHighestRoleLevel(currentUser?.roles || []);

      if (!isSuper && parsedLevel >= currentLevel) {
        await t.rollback();
        req.flash("error", "Role level must be lower than your level");
        return res.redirect("/admin/roles/create");
      }

      const exists = await db.Role.findOne({
        where: {
          [Op.or]: [{ name }, { displayName }]
        }
      });

      if (exists) {
        await t.rollback();
        req.flash("error", "Role already exists");
        return res.redirect("/admin/roles/create");
      }

      const role = await db.Role.create(
        {
          name,
          displayName,
          description,
          level: parsedLevel,
          createdBy: req.session.user.id,
          isSystem: false
        },
        { transaction: t }
      );

      const ids = normalizeIdArray(permissionIds);

      if (ids.length) {
        const rows = ids.map(id => ({
          roleId: role.id,
          permissionId: id,
          grantedBy: req.session.user.id
        }));

        await db.RolePermission.bulkCreate(rows, { transaction: t });
      }

      await t.commit();

      req.flash("success", "Role created successfully");
      res.redirect("/admin/roles");

    } catch (err) {
      await t.rollback();
      console.error('Error in createRole:', err);
      req.flash("error", "Failed to create role");
      res.redirect("/admin/roles/create");
    }
  },

  /*
  =====================================================
  EDIT ROLE FORM
  =====================================================
  */
  editRoleForm: async (req, res) => {
    try {
      const role = await db.Role.findByPk(req.params.id, {
        include: [
          {
            model: db.Permission,
            as: "permissions",
            through: { attributes: [] }
          }
        ]
      });

      if (!role) {
        req.flash("error", "Role not found");
        return res.redirect("/admin/roles");
      }

      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [
          {
            model: db.Role,
            as: "roles",
            include: [
              {
                model: db.Permission,
                as: "permissions",
                through: { attributes: [] }
              }
            ]
          }
        ]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentLevel = getHighestRoleLevel(currentUser?.roles || []);

      if (!isSuper && currentLevel <= role.level) {
        req.flash("error", "You cannot edit this role");
        return res.redirect("/admin/roles");
      }

      const permissions = await db.Permission.findAll({
        order: [["module", "ASC"], ["action", "ASC"]]
      });

      const groupedPermissions = {};

      permissions.forEach(p => {
        if (!groupedPermissions[p.module]) {
          groupedPermissions[p.module] = [];
        }
        groupedPermissions[p.module].push(p);
      });

      res.render("admin/roles/edit", {
        title: "Edit Role",
        role: role.toJSON(),
        rolePermissions: role.permissions.map(p => p.id),
        groupedPermissions,
        maxAssignableLevel: isSuper ? 100 : currentLevel - 1,
        user: req.session.user
      });

    } catch (err) {
      console.error('Error in editRoleForm:', err);
      req.flash("error", "Failed to load role");
      res.redirect("/admin/roles");
    }
  },

  /*
  =====================================================
  UPDATE ROLE
  =====================================================
  */
  updateRole: async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
      const { name, displayName, description, level, permissionIds } = req.body;

      const parsedLevel = parseInt(level, 10);
      const ids = normalizeIdArray(permissionIds);

      const role = await db.Role.findByPk(req.params.id);

      if (!role) {
        await t.rollback();
        req.flash("error", "Role not found");
        return res.redirect("/admin/roles");
      }

      if (role.isSystem) {
        await t.rollback();
        req.flash("error", "System roles cannot be modified");
        return res.redirect("/admin/roles");
      }

      const currentUser = await db.User.findByPk(req.session.user.id, {
        include: [
          {
            model: db.Role,
            as: "roles",
            include: [
              {
                model: db.Permission,
                as: "permissions",
                through: { attributes: [] }
              }
            ]
          }
        ]
      });

      const isSuper = isSuperAdmin(req.session.user, currentUser);
      const currentLevel = getHighestRoleLevel(currentUser?.roles || []);

      if (!isSuper && currentLevel <= role.level) {
        await t.rollback();
        req.flash("error", "You cannot edit this role");
        return res.redirect("/admin/roles");
      }

      await role.update(
        {
          name,
          displayName,
          description,
          level: parsedLevel
        },
        { transaction: t }
      );

      await db.RolePermission.destroy({
        where: { roleId: role.id },
        transaction: t
      });

      if (ids.length) {
        const rows = ids.map(id => ({
          roleId: role.id,
          permissionId: id,
          grantedBy: req.session.user.id
        }));

        await db.RolePermission.bulkCreate(rows, { transaction: t });
      }

      await t.commit();

      req.flash("success", "Role updated successfully");
      res.redirect("/admin/roles");

    } catch (err) {
      await t.rollback();
      console.error('Error in updateRole:', err);
      req.flash("error", "Failed to update role");
      res.redirect(`/admin/roles/${req.params.id}/edit`);
    }
  },

  /*
  =====================================================
  DELETE ROLE
  =====================================================
  */
  deleteRole: async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
      const role = await db.Role.findByPk(req.params.id);

      if (!role) {
        await t.rollback();
        return res.json({ success: false, message: "Role not found" });
      }

      if (role.isSystem) {
        await t.rollback();
        return res.json({
          success: false,
          message: "System role cannot be deleted"
        });
      }

      const assigned = await db.UserRole.count({
        where: { roleId: role.id }
      });

      if (assigned) {
        await t.rollback();
        return res.json({
          success: false,
          message: "Role is assigned to users"
        });
      }

      await db.RolePermission.destroy({
        where: { roleId: role.id },
        transaction: t
      });

      await role.destroy({ transaction: t });

      await t.commit();

      res.json({ success: true });

    } catch (err) {
      await t.rollback();
      console.error('Error in deleteRole:', err);
      res.json({ success: false, message: err.message });
    }
  }
};

module.exports = roleController;