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

const flash = require('express-flash');

// Database
const db = require('../models');

// Import routes
const loadPermissions = require('./middlewares/loadPermissions');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Session store using Sequelize
const sessionStore = new SequelizeStore({
  db: db.sequelize,
  tableName: 'Sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.APP_URL 
    : 'http://localhost:3000',
  credentials: true
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

  
  
  // Re-set them because req.flash clears them
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.warning = req.flash('warning');
  res.locals.info = req.flash('info');

  next();
});

// Load user permissions and sidebar modules before routes
app.use(loadPermissions);

// View engine setup
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/admin');
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Routes
app.use('/', routes);


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
const { autoCreatePermissions, assignAllPermissionsToSuperAdmin, assignDefaultPermissionsToAdmin } = require('./utils/permissionGenerator');

db.sequelize.authenticate()
  .then(async () => {
    console.log('Database connected successfully');

    try {
      const perms = await autoCreatePermissions();
      console.log(`Auto permission generation - created ${perms.created}, skipped ${perms.skipped}`);
      const superResult = await assignAllPermissionsToSuperAdmin();
      console.log(`Super admin permission assignment - assigned ${superResult.assigned}, skipped ${superResult.skipped}`);
      const adminResult = await assignDefaultPermissionsToAdmin();
      console.log(`Admin permission assignment - assigned ${adminResult.assigned}, skipped ${adminResult.skipped}`);
    } catch (generateError) {
      console.error('Auto permission sync failed at startup:', generateError);
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Admin Panel: http://localhost:${PORT}/admin`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
    process.exit(1);
  });



module.exports = app;

