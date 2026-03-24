const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
    },
    operationsSorter: "method",   // 👈 GET, POST, PUT, DELETE order
      tagsSorter: "alpha", 
    servers: [
      {
        url: process.env.APP_URL || `http://localhost:${process.env.PORT}`,
      },
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

  // 👇 VERY IMPORTANT (correct path)
  apis: ["./src/routes/api/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;