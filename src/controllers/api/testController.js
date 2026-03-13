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