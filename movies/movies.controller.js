const moviesService = require('./movies.service');
const logger = require('./logger');

exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Admin only." });
    }
};

exports.getAllMovies = async (req, res) => {
    try {
        const movies = await moviesService.getAllMovies();
        res.json(movies);
    } catch (error) {
        logger.error(`Erro ao listar filmes: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await moviesService.getMovieById(req.params.id);
        res.json(movie);
    } catch (error) {
        const status = error.message === 'Filme não encontrado' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};

exports.createMovie = async (req, res) => {
    try {
        const movie = await moviesService.createMovie(req.body);
        res.status(201).json(movie);
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ error: error.message });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        const updatedMovie = await moviesService.updateMovie(req.params.id, req.body);
        res.json(updatedMovie);
    } catch (error) {
        const status = error.message === 'Filme não encontrado' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        await moviesService.deleteMovie(req.params.id);
        res.json({ message: 'Filme removido com sucesso' });
    } catch (error) {
        const status = error.message === 'Filme não encontrado' ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
};
