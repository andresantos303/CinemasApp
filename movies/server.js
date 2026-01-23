require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Logger
const logger = require("./logger");

// Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const moviesRoutes = require("./movies.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/", moviesRoutes);

let swaggerFile = null;
const swaggerPath = path.join(__dirname, 'swagger-output.json');

if (fs.existsSync(swaggerPath)) {
  swaggerFile = require(swaggerPath);
}

if (swaggerFile) {
  // Acede à documentação em /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// DB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "movies",
  })
  .then(() => logger.info("MongoDB connected successfully"))
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  logger.info(`Movies microservice running on port ${PORT}`);
  logger.info(`Docs available at http://localhost/api/movies:${PORT}/api-docs`);
});