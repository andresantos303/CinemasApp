const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'API de Users (CinemaApp)',
    description: 'Micro serviço de gestão de utilizadores',
    version: '1.0.0',
  },
  host: 'localhost:3001',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Insira o token no formato: Bearer <token>'
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./users.routes.js']; // O ficheiro onde estão as rotas

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('Ficheiro swagger-output.json gerado com sucesso!');
});