require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./logger');
const userRoutes = require('./users.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/users', userRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'users ok' });
});

// Conexão com MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb://root:example@mongo:27017/usersdb?authSource=admin';

mongoose.connect(mongoUrl)
  .then(() => logger.info('MongoDB (users) ligado com sucesso'))
  .catch(err => logger.error(`Erro MongoDB: ${err.message}`));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Users service a correr na porta ${PORT}`);
  logger.info(`Health check disponível em http://localhost:${PORT}/health`);
});
