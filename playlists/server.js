require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('./logger');

const graphqlRoutes = require('./graphql.routes');

const app = express();
app.use(cors());
app.use(express.json());

// GraphQL endpoint
graphqlRoutes(app);

const mongoUrl = process.env.MONGODB_URI || 'mongodb://mongo:27017/playlistsdb';

mongoose.connect(mongoUrl, { dbName: 'playlists' })
  .then(() => logger.info('MongoDB (Playlists) ligado com sucesso'))
  .catch(err => logger.error(`Erro MongoDB: ${err.message}`));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    logger.info(`Playlists Service a correr na porta ${PORT}`);
    logger.info(`GraphQL disponível em http://localhost:${PORT}/graphql`);
});
