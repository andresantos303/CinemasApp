const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Users API (CinemaApp)',
    description: 'User management microservice',
    version: '1.0.0',
  },
  host: 'localhost:3001',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter the token in the format: Bearer <token>'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./users.routes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('swagger-output.json file generated successfully!');
});