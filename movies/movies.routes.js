const express = require("express");
const router = express.Router();
const movieController = require("./movies.controller");
const { verifyAdmin } = require("./auth.middleware");

// --- ROTAS PÚBLICAS ---

router.get("/", (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Listar todos os filmes'
  // #swagger.description = 'Retorna uma lista de filmes. Permite filtrar por género, ano e limitar a quantidade.'
  /* #swagger.parameters['genre'] = { description: 'Filtrar por género (ex: "Ação")', type: 'string' } */
  /* #swagger.parameters['year'] = { description: 'Filtrar por ano de lançamento', type: 'number' } */
  /* #swagger.parameters['limit'] = { description: 'Limitar número de resultados', type: 'number' } */
  movieController.getAllMovies(req, res, next);
});

router.get("/:id", (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Obter detalhes de um filme'
  // #swagger.description = 'Retorna os dados completos de um filme específico pelo seu ID.'
  movieController.getMovieById(req, res, next);
});

// --- ROTAS PROTEGIDAS (ADMIN) ---

router.post("/", verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Adicionar filme (Admin)'
  // #swagger.description = 'Cria um novo filme na base de dados. Requer token de Admin.'
  // #swagger.security = [{ "bearerAuth": [] }]
  
  /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { 
                    $title: "Matrix",
                    $director: "Wachowskis",
                    $genre: "Sci-Fi",
                    $year: 1999,
                    $duration: 136,
                    $releaseDate: "1999-03-31",
                    $image: "https://example.com/poster.jpg"
                } 
            }
        }
    } */
  movieController.createMovie(req, res, next);
});

router.put("/:id", verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Atualizar filme (Admin)'
  // #swagger.description = 'Atualiza os dados de um filme existente.'
  // #swagger.security = [{ "bearerAuth": [] }]
  
  /* #swagger.requestBody = {
        content: {
            "application/json": {
                schema: { 
                    title: "Matrix Reloaded",
                    duration: 138
                } 
            }
        }
    } */
  movieController.updateMovie(req, res, next);
});

router.delete("/:id", verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Remover filme (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  movieController.deleteMovie(req, res, next);
});

module.exports = router;