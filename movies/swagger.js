const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API de Movies (CinemaApp)',
    description: 'Micro serviço de gestão de filmes',
    version: '1.0.0',
  },
  host: 'localhost:3002',
  schemes: ['http'],
  definitions: {
      Movie: {
          title: "Inception",
          director: "Christopher Nolan",
          category: "Sci-Fi",
          duration: 148,
          releaseDate: "2010-07-16"
      }
  },
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Token JWT do serviço de Users'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./movies.routes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);