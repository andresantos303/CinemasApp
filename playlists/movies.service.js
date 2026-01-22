const axios = require("axios");
const logger = require("./logger");

const MOVIE_API_URL = process.env.MOVIES_SERVICE_URL || "http://localhost:3002/";

exports.fetchMovieById = async (movieId) => {
  try {
    // Faz um pedido GET ao outro microsserviço
    const response = await axios.get(`${MOVIE_API_URL}/${movieId}`);
    return response.data; // Retorna o objeto do filme { _id, title, duration, ... }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; // Filme não existe
    }
    logger.error(`Erro ao comunicar com o Movies Service: ${error.message}`);
    throw new Error("Falha na comunicação com o serviço de filmes");
  }
};