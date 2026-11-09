// Swagger / OpenAPI 3.0 configuration
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Orders & Inventory API - Web & Database Lab 3 Homework',
      version: '1.0.0',
      description: 'Express + MySQL orders API with transactions, JOIN queries and analytics'
    },
    servers: [
      {
        url: 'http://localhost:3001/api/v1',
        description: 'Development Local Server'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger UI documentation is ready at: http://localhost:3001/api-docs');
};

module.exports = setupSwagger;
