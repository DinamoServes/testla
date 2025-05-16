const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const router = express.Router();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Watersky Hosting API',
      version: '1.0.0',
      description: 'API documentation for Watersky Hosting platform',
    },
    servers: [
      { url: 'http://localhost:4000/api' },
      { url: 'https://yourdomain.com/api' }
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

router.use('/', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = router; 