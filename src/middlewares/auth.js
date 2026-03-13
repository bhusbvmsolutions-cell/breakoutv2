const db = require('../../models');

// Check if user is authenticated
const isAuthenticated = async (req, res, next) => {
  if (req.session && req.session.user) {
    // Check if user still exists in database
    const user = await db.User.findByPk(req.session.user.id, {
      include: [{
        model: db.Role,
        as: 'roles',
        attributes: ['id', 'name', 'level'],
        through: { attributes: [] }
      }]
    });
    if (user && user.isActive) {
      req.user = user;
      return next();
    } else {
      // Clear invalid session
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
    }
  }
  
  // For API requests
  if (req.path.startsWith('/api')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }
  
  // For admin panel - redirect to login
  res.redirect('/admin/login');
};

// Check if user is admin or super_admin
const isAdmin = (req, res, next) => {
  const user = req.session.user;
  
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    return next();
  }
  
  // Check through roles if available
  if (req.user && req.user.roles) {
    const hasAdminRole = req.user.roles.some(r => 
      ['admin', 'super_admin'].includes(r.name)
    );
    if (hasAdminRole) {
      return next();
    }
  }

  if (req.session.user?.roles) {
    const hasAdminRole = req.session.user.roles.some(r =>
      ['admin', 'super_admin'].includes(r.name)
    );
    if (hasAdminRole) {
      return next();
    }
  }
  
  if (req.path.startsWith('/api')) {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
  
  res.status(403).render('error', { 
    title: 'Access Denied',
    message: 'Admin privileges required to access this page',
    error: { status: 403 }
  });
};

// Redirect if already logged in
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin,
  redirectIfAuthenticated
};
