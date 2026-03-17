const db = require("../../../models");

const testController = {
    // Public test endpoint
    publicTest: (req, res) => {
      res.json({
        success: true,
        message: 'Public API test endpoint',
        timestamp: new Date().toISOString(),
        data: {
          version: '1.0.0',
          endpoints: {
            public: '/api/test/public',
            protected: '/api/test/protected',
            admin: '/api/test/admin'
          }
        }
      });
    },


    sitesettingTest: async (req, res) => {

      const settings = await db.SiteSetting.findAll({
        where: { id: 1 },
        raw: true
      });
    
      res.json({
        success: true,
        message: 'Public API test endpoint',
        settings: settings,
        timestamp: new Date().toISOString(),
        data: {
          version: '1.0.0',
          endpoints: {
            public: '/api/test/public',
            protected: '/api/test/protected',
            admin: '/api/test/admin'
          }
        }
      });
    },
  
    // Protected test endpoint (requires authentication)
    protectedTest: (req, res) => {
      res.json({
        success: true,
        message: 'Protected API test endpoint',
        user: req.session.user || req.user,
        timestamp: new Date().toISOString()
      });
    },
  
    // Admin test endpoint (requires admin role)
    adminTest: (req, res) => {
      res.json({
        success: true,
        message: 'Admin API test endpoint',
        user: req.session.user || req.user,
        timestamp: new Date().toISOString()
      });
    },
  
    // Health check
    health: (req, res) => {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    }
  };
  
  module.exports = testController;