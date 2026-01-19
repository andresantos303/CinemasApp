const Movie = require('./movies.model');
const logger = require('./logger');


async function getAllMovies() {
    const movies = await Movie.find();
    logger.info(`Listagem de filmes solicitada. Total: ${movies.length}`);
    return movies;
}


async function getMovieById(id) {
    const movie = await Movie.findById(id);
    if (!movie) {
        throw new Error('Filme não encontrado');
    }
    return movie;
}


async function createMovie(data) {
    if (data.title && data.title.length > 64) {
        logger.warn(`Title is too big: ${data.title}`);
        const err = new Error('Title should be lower than 64 characters');
        err.status = 400;
        throw err;
    }

    logger.info(`Admin a criar filme: ${data.title}`);
    const movie = await Movie.create(data);
    return movie;
}

async function updateMovie(id, data) {
    logger.info(`Admin a atualizar filme ID: ${id}`);
    const updatedMovie = await Movie.findByIdAndUpdate(id, data, { new: true });
    if (!updatedMovie) throw new Error('Filme não encontrado');
    return updatedMovie;
}

/**
 * Remover filme
 */
async function deleteMovie(id) {
    logger.info(`Admin a remover filme ID: ${id}`);
    const deleted = await Movie.findByIdAndDelete(id);
    if (!deleted) throw new Error('Filme não encontrado');
    return deleted;
}

module.exports = {
    getAllMovies,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    
};