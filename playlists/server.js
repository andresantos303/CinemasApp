require("dotenv").config();
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const cors = require("cors");

const { schema, root } = require("./graphqlSchema"); 
const adsRoutes = require("./ads.routes");
const logger = require("./logger");
const { verifyAdmin } = require("./auth.middleware");


const app = express();

app.use(cors());
app.use(express.json());

// --- 1. Rotas REST ---
app.use("/ads", adsRoutes);

// --- 2. Rota GraphQL ---
app.use(
  "/graphql",
  verifyAdmin,
  graphqlHTTP({
    schema: schema,
    rootValue: root,
  })
);

// --- 4. Ligação Base de Dados ---
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "playlists",
  })
  .then(() => logger.info("MongoDB ligado com sucesso"))
  .catch((err) => logger.error(`Erro na ligação MongoDB: ${err.message}`));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  logger.info(`Micro serviço de Playlists a correr na porta ${PORT}`);
});