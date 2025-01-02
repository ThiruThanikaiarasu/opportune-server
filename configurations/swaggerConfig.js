const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.1.0', 
    info: {
      title: 'Opportune',
      version: '1.0.0',
      description: 'API documentation for Opportune',
      contact: {
        name: 'Thirunavukkarasu',
        email: 'thiru.thanikaiarasu@gmail.com',
      },
    },
    servers: [
      {
        url: `${process.env.SERVER_URL}/api/v1`, 
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'], 
};



const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec