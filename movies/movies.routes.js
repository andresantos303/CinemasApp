const express = require('express');
const router = express.Router();
const movieController = require('./movies.controller');
const controller = require('./movies.controller');


// Rotas Públicas
router.get('/', (req, res, next) => {
    // #swagger.tags = ['Movies']
    // #swagger.summary = 'Listar todos os filmes'
    movieController.getAllMovies(req, res, next);
});

router.get('/:id', (req, res, next) => {
    // #swagger.tags = ['Movies']
    // #swagger.summary = 'Obter detalhes de um filme'
    movieController.getMovieById(req, res, next);
});

// Rotas Protegidas (Admin)
router.post('/', movieController.verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Movies']
    // #swagger.summary = 'Adicionar filme (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { $ref: "#/definitions/Movie" }
            }
        }
    } */
    movieController.createMovie(req, res, next);
});

router.put('/:id', movieController.verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Movies']
    // #swagger.summary = 'Atualizar filme (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    movieController.updateMovie(req, res, next);
});

router.delete('/:id', movieController.verifyAdmin, (req, res, next) => {
    // #swagger.tags = ['Movies']
    // #swagger.summary = 'Remover filme (Admin)'
    // #swagger.security = [{ "bearerAuth": [] }]
    movieController.deleteMovie(req, res, next);
});

module.exports = router;