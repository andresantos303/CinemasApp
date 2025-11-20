require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const logger = require('./logger');
//const pinoHttp = require('pino-http')({ logger });

const swaggerUi = require('swagger-ui-express');

// Como o ficheiro é gerado dinamicamente, usamos um require que pode falhar na primeira execução se não existir
let swaggerFile;
try { swaggerFile = require('./swagger-output.json'); } catch (e) { swaggerFile = {}; }

const movieRoutes = require('./movies.routes');

const app = express();

app.use(cors());
app.use(express.json());
//app.use(pinoHttp);

app.use('/movies', movieRoutes);

// Documentação
if (swaggerFile) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'movies'
})
    .then(() => logger.info('MongoDB (Movies) ligado com sucesso'))
    .catch((err) => logger.error(`Erro na ligação MongoDB: ${err.message}`));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    logger.info(`Micro serviço de Movies a correr na porta ${PORT}`);
    logger.info(`Docs disponíveis em http://localhost:${PORT}/api-docs`);
});