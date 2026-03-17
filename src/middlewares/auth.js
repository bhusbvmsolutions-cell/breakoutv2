const db = require("../../models");

// Check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return handleUnauthenticated(req, res);
    }

    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          as: "roles",
          attributes: ["id", "name", "level"],
          through: { attributes: [] },
        },
      ],
    });

    if (!user || !user.isActive) {
      req.session.destroy();
      return handleUnauthenticated(req, res);
    }

    req.user = user;
    res.locals.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    next(err);
  }
};

function handleUnauthenticated(req, res) {
  if (req.path.startsWith("/api")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  return res.redirect("/admin/login");
}

// Admin access
const isAdmin = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect("/admin/login");
  }

  const roles = req.session.user.roles || [];

  const hasAdminRole = roles.some(
    (r) => r.name === "admin" || r.name === "super_admin",
  );

  if (!hasAdminRole) {
    return res.status(403).render("error", {
      title: "Forbidden",
      message: "You do not have permission to access this page",
      layout: false,
    });
  }

  next();
};

function handleForbidden(req, res, message) {
  if (req.path.startsWith("/api")) {
    return res.status(403).json({
      success: false,
      error: message,
    });
  }

  return res.status(403).render("error", {
    title: "Access Denied",
    message,
    error: { status: 403 },
  });
}

// Redirect if logged in
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session?.user?.id) {
    return res.redirect("/admin/dashboard");
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  redirectIfAuthenticated,
};
