require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Logger
const logger = require("./logger");

// Swagger
const swaggerUi = require('swagger-ui-express');
// Como o ficheiro é gerado dinamicamente, usamos um require que pode falhar na primeira execução se não existir
let swaggerFile;
try { swaggerFile = require('./swagger-output.json'); } catch (e) { swaggerFile = {}; }

const userRoutes = require("./users.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/", userRoutes);

// Documentação
if (swaggerFile) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// Ligação DB
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "users",
  })
  .then(() => logger.info("MongoDB ligado com sucesso"))
  .catch((err) => logger.error(`Erro na ligação MongoDB: ${err.message}`));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Micro serviço de Users a correr na porta ${PORT}`);
  logger.info(`Docs disponíveis em http://localhost:${PORT}/api-docs`);
});
