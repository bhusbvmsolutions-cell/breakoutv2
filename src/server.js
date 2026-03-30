const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
require('dotenv').config();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const methodOverride = require('method-override');
const flash = require('express-flash');

// Database
const db = require('../models');

// Import routes
// const loadPermissions = require('./middlewares/loadPermissions');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);


// Session store using Sequelize
const sessionStore = new SequelizeStore({
  db: db.sequelize,
  tableName: 'Sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false
  })
);

app.use(methodOverride('_method'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.APP_URL 
    : 'http://localhost:3000',
  credentials: true
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
console.log("STATIC PATH:", path.join(__dirname, 'public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Sync session store
sessionStore.sync();

app.use((req, res, next) => {
  console.log("SESSION:", req.session);
  next();
});


app.use(flash());
// Make user available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentUrl = req.url;
  res.locals.baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  res.locals.frontUrl = process.env.FRONTEND_URL || `http://localhost:${PORT}`;

  
  
  // Re-set them because req.flash clears them
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.info = req.flash('info');

  next();
});

// Load user permissions and sidebar modules before routes
// app.use(loadPermissions);

// View engine setup
app.use(expressLayouts);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/admin');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);



app.use((req, res, next) => {
  // Helper for views: can(resource, action)
  res.locals.can = (resource, action) => {
    const user = res.locals.user;
    const permissions = res.locals.permissions;

    // Super admins bypass all checks
    if (user) {
      const isSuperAdmin =
        user.role === 'super_admin' ||
        (user.roles && user.roles.some(r => r.name === 'super_admin'));
      if (isSuperAdmin) return true;
    }

    if (!permissions) return false;

    // Direct permission check
    if (permissions.has(`${resource}:${action}`)) return true;

    // 'manage' action grants all actions on that resource
    if (permissions.has(`${resource}:manage`)) return true;

    return false;
  };

  next();
});



// show all archive pages in sidebar for faqs and google reviews
app.use(async (req, res, next) => {
  try {
    const pages = await db.Page.findAll({
      where: { reference: 'archive' },
      attributes: ['id', 'name', 'slug', 'reference'],
      order: [['name', 'ASC']],
    });
    res.locals.archivePages = pages;
    next();
  } catch (error) {
    console.error('Error fetching archive pages:', error);
    res.locals.archivePages = [];
    next();
  }
});


// Routes
app.use('/', routes);



app.use("/api/docs", swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: false,
    swaggerOptions: {
      operationsSorter: "method", // ✅ GET, POST, PUT, DELETE order
      tagsSorter: "alpha",        // ✅ alphabetical tags
    },
  })
);


// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ 
      success: false, 
      error: 'API endpoint not found' 
    });
  } else {
    res.status(404).render('error', { 
      title: '404 Not Found',
      message: 'Page not found',
      error: { status: 404 }
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  if (req.path.startsWith('/api')) {
    res.status(status).json({ 
      success: false,
      error: message
    });
  } else {
    res.status(status).render('error', {
      title: `Error ${status}`,
      message,
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  }
});








// Database connection and server start
// const { autoCreatePermissions, assignAllPermissionsToSuperAdmin, assignDefaultPermissionsToAdmin } = require('./utils/permissionGenerator');


db.sequelize.authenticate()
  .then(async () => {
    console.log('Database connected successfully');

    // ✅ Only start server if NOT running under Passenger
    if (require.main === module) {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`API: http://localhost:${PORT}/api`);
        console.log(`Admin Panel: http://localhost:${PORT}/admin`);
      });
    }
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
    process.exit(1);
  });



module.exports = app;

