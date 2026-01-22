const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

// 1. Definição do ficheiro de saída
const outputFile = path.join(__dirname, 'swagger-output.json');

// 2. Definição do ficheiro de entrada (onde estão as rotas)
// O path.join garante que ele encontra o ficheiro na mesma pasta, independentemente de onde corres o comando
const endpointsFiles = [path.join(__dirname, 'movies.routes.js')];

const doc = {
  info: {
    title: 'Movies API',
    description: 'Microserviço para gestão de filmes e catálogo.',
    version: '1.0.0'
  },
  host: 'localhost:3002', // Confirma se esta porta bate certo com o teu .env
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"'
    }
  }
};

console.log("🚀 A iniciar geração do Swagger...");
console.log("📂 A ler rotas de:", endpointsFiles);

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log("✅ Swagger gerado com sucesso em:", outputFile);
});