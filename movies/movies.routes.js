const express = require("express");
const router = express.Router();
const movieController = require("./movies.controller");

// Rotas Públicas
router.get("/", (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Listar todos os filmes'
  // #swagger.parameters['genre'] = { description: 'Filtrar por género', type: 'string' }
  // #swagger.parameters['year'] = { description: 'Filtrar por ano', type: 'number' }
  // #swagger.parameters['limit'] = { description: 'Limitar número de resultados', type: 'number' }
  movieController.getAllMovies(req, res, next);
});

router.get("/:id", (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Obter detalhes de um filme'
  movieController.getMovieById(req, res, next);
});

// Rotas Protegidas (Admin)
router.post("/", movieController.verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Adicionar filme (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { 
                    title: "Matrix",
                    director: "Wachowskis",
                    genre: "Sci-Fi",
                    year: 1999,
                    duration: 136
                } 
            }
        }
    } */
  movieController.createMovie(req, res, next);
});

router.put("/:id", movieController.verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Atualizar filme (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.requestBody = {
        content: {
            "application/json": {
                schema: { 
                    title: "Matrix Reloaded"
                } 
            }
        }
    } */
  movieController.updateMovie(req, res, next);
});

router.delete("/:id", movieController.verifyAdmin, (req, res, next) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Remover filme (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  movieController.deleteMovie(req, res, next);
});

module.exports = router;
