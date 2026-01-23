require("dotenv").config();
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const cors = require("cors");

const { schema, root } = require("./graphqlSchema"); 
const adsRoutes = require("./ads.routes");
const logger = require("./logger");
const { verifyAdmin } = require("./auth.middleware");

// Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

// --- Rotas REST ---
app.use("/ads", adsRoutes);

// --- Rota GraphQL ---
app.use(
  "/graphql",
  verifyAdmin,
  graphqlHTTP({
    schema: schema,
    rootValue: root,
  })
);

let swaggerFile = null;
const swaggerPath = path.join(__dirname, 'swagger-output.json');

if (fs.existsSync(swaggerPath)) {
  swaggerFile = require(swaggerPath);
}

if (swaggerFile) {
  // Acede à documentação em /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// --- Ligação Base de Dados ---
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "playlists",
  })
  .then(() => logger.info("MongoDB connected successfully"))
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  logger.info(`Playlists microservice running on port ${PORT}`);
  logger.info(`Docs for ads available at http://localhost/api/playlists:${PORT}/api-docs`);
});