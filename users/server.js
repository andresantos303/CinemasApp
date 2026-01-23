require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Logger
const logger = require("./logger");

// Swagger
const swaggerUi = require('swagger-ui-express');
// Since the file is generated dynamically, we use a require that might fail on the first run if it doesn't exist
let swaggerFile;
try { swaggerFile = require('./swagger-output.json'); } catch (e) { swaggerFile = {}; }

const userRoutes = require("./users.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/", userRoutes);

// Documentation
if (swaggerFile) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
}

// DB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "users",
  })
  .then(() => logger.info("MongoDB connected successfully"))
  .catch((err) => logger.error(`MongoDB connection error: ${err.message}`));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Users microservice running on port ${PORT}`);
  logger.info(`Docs for available at http://localhost/api/users:${PORT}/api-docs`);
});