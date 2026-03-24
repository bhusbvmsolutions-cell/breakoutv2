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
            public: '/api/public',
            protected: '/api/protected',
            admin: '/admin'
          }
        }
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