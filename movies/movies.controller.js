const Movie = require('./movies.model');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

// --- Middleware de Segurança ---
// Verifica se o token é válido e se é Admin
exports.verifyAdmin = (req, res, next) => {
    const tokenHeader = req.headers['authorization'];
    
    if (!tokenHeader) {
        logger.warn('Tentativa de alteração de filmes sem token.');
        return res.status(403).json({ message: 'Token não fornecido' });
    }

    try {
        const token = tokenHeader.split(' ')[1] || tokenHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.type !== 'admin') {
            logger.warn(`Acesso negado: User ${decoded.id} tentou alterar filmes.`);
            return res.status(401).json({ message: 'Acesso negado: Requer Admin' });
        }
        
        req.userId = decoded.id;
        next();
    } catch (error) {
        logger.warn(`Token inválido no serviço de Movies: ${error.message}`);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

// --- Lógica CRUD ---

exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        logger.info(`Listagem de filmes solicitada. Total: ${movies.length}`);
        res.json(movies);
    } catch (error) {
        logger.error(`Erro ao listar filmes: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ message: 'Filme não encontrado' });
        res.json(movie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createMovie = async (req, res) => {
    try {
        logger.info(`Admin a criar filme: ${req.body.title}`);
        const newMovie = new Movie(req.body);
        await newMovie.save();
        res.status(201).json(newMovie);
    } catch (error) {
        logger.error(`Erro ao criar filme: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        logger.info(`Admin a atualizar filme ID: ${req.params.id}`);
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedMovie);
    } catch (error) {
        logger.error(`Erro ao atualizar filme: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        logger.info(`Admin a remover filme ID: ${req.params.id}`);
        await Movie.findByIdAndDelete(req.params.id);
        res.json({ message: 'Filme removido com sucesso' });
    } catch (error) {
        logger.error(`Erro ao remover filme: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};