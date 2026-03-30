const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

const PORT = process.env.PORT || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
    },
    servers: [
      { url: APP_URL },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
        },
      },
    },
  },

  // ✅ Use absolute path + support subfolders
  apis: [path.join(__dirname, "./routes/api/**/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;