const axios = require("axios");
const logger = require("./logger");

// Ensures the URL does not end with a slash to avoid duplicates in concatenation
const baseUrl = process.env.MOVIES_SERVICE_URL ;
const MOVIE_API_URL = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

exports.fetchMovieById = async (movieId) => {
  const targetUrl = `${MOVIE_API_URL}/${movieId}`;

  try {    
    const response = await axios.get(targetUrl);
    return response.data; 
  } catch (error) {
    // Detailed error log
    if (error.response) {
      // The server responded with a status outside the 2xx range
      logger.warn(`[MoviesService] Response error: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.status === 404) {
        return null; // Movie does not exist, expected behavior
      }
    } else if (error.request) {
      // The request was made but there was no response
      logger.error(`[MoviesService] No response from server. Is the Movies service running at ${MOVIE_API_URL}?`);
    } else {
      // Error setting up the request
      logger.error(`[MoviesService] Error setting up request: ${error.message}`);
    }
    
    // Throw the error for the Resolver to catch
    throw new Error(`Communication failure with the movies service: ${error.message}`);
  }
};