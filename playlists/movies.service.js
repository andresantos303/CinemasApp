const axios = require("axios");
const logger = require("./logger");

// Garante que o URL não termina com barra para evitar duplicados na concatenação
const baseUrl = process.env.MOVIES_SERVICE_URL || "http://localhost:3002";
const MOVIE_API_URL = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

exports.fetchMovieById = async (movieId) => {
  const targetUrl = `${MOVIE_API_URL}/${movieId}`;

  try {    
    const response = await axios.get(targetUrl);
    return response.data; 
  } catch (error) {
    // Log detalhado do erro
    if (error.response) {
      // O servidor respondeu com um status fora do range 2xx
      logger.warn(`[MoviesService] Erro na resposta: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.status === 404) {
        return null; // Filme não existe, comportamento esperado
      }
    } else if (error.request) {
      // O pedido foi feito mas não houve resposta
      logger.error(`[MoviesService] Sem resposta do servidor. O serviço de Movies está a correr em ${MOVIE_API_URL}?`);
    } else {
      // Erro na configuração do pedido
      logger.error(`[MoviesService] Erro ao configurar pedido: ${error.message}`);
    }
    
    // Lança o erro para o Resolver apanhar
    throw new Error(`Falha na comunicação com o serviço de filmes: ${error.message}`);
  }
};