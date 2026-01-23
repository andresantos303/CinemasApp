const { buildSchema } = require("graphql");
const Playlist = require("./models/playlists.model");
const Ad = require("./models/ads.model");
const moviesService = require("./movies.service");
const logger = require("./logger"); // <--- 1. Import logger

const schema = buildSchema(`
  type MovieObject {
    id: String
    title: String
    director: String
    poster: String
  }
  
  type Ad {
    id: ID
    title: String
    duration: Int
    advertiser: String
    url: String
  }

  type Playlist {
    id: ID
    title: String
    description: String
    # owner_id exists in DB but is not exposed here
    duration: Int
    mainMovie: MovieObject
    order: [Ad]
  }

  type Query {
    playlist(id: ID!): Playlist
    playlists: [Playlist]
  }

  type Mutation {
    createPlaylist(title: String!, description: String): Playlist
    deletePlaylist(id: ID!): String
    addMovieToPlaylist(playlistId: ID!, movieId: String!): Playlist
    addAdToPlaylist(playlistId: ID!, adId: ID!): Playlist
    reorderPlaylist(playlistId: ID!, adId: ID!, newPosition: Int!): Playlist  }
`);

const root = {
  // --- QUERIES ---
  playlist: async ({ id }) => {
    try {
      logger.info(`[GraphQL] Searching for playlist: ${id}`);
      const result = await Playlist.findById(id).populate("order");
      if (!result) logger.warn(`[GraphQL] Playlist ${id} not found.`);
      return result;
    } catch (error) {
      logger.error(`[GraphQL] Error in playlist query: ${error.message}`);
      throw error;
    }
  },
  
  playlists: async () => {
    try {
      logger.info(`[GraphQL] Listing all playlists`);
      return await Playlist.find({}).populate("order");
    } catch (error) {
      logger.error(`[GraphQL] Error in playlists query: ${error.message}`);
      throw error;
    }
  },

  // --- MUTATIONS ---

  createPlaylist: async ({ title, description }, context) => {
    // Verify authentication
    if (!context.userId) {
      const msg = "User not authenticated (Empty context)";
      logger.warn(`[GraphQL] Blocked: ${msg}`);
      throw new Error(msg);
    }

    logger.info(`[GraphQL] User ${context.userId} creating playlist: '${title}'`);

    try {
      const newPlaylist = new Playlist({ 
        title, 
        description, 
        owner_id: context.userId
      });
      
      await newPlaylist.save();
      
      logger.info(`[GraphQL] Success: Playlist created with ID ${newPlaylist._id}`);
      return newPlaylist;

    } catch (error) {
      logger.error(`[GraphQL] Error creating playlist: ${error.message}`);
      throw error;
    }
  },

  deletePlaylist: async ({ id }) => {
    logger.info(`[GraphQL] Attempting to remove playlist: ${id}`);
    try {
      const deleted = await Playlist.findByIdAndDelete(id);
      if (!deleted) {
        logger.warn(`[GraphQL] Failed to remove: Playlist ${id} not found`);
        throw new Error("Playlist not found");
      }
      
      logger.info(`[GraphQL] Playlist removed successfully: ${id}`);
      return "Playlist removed successfully";
    } catch (error) {
      logger.error(`[GraphQL] Error removing playlist: ${error.message}`);
      throw error;
    }
  },

  addMovieToPlaylist: async ({ playlistId, movieId }) => {
    logger.info(`[GraphQL] Adding movie ${movieId} to playlist ${playlistId}`);
    
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new Error("Playlist not found");

      // Fetch external movie
      console.log("Fetching movie from external service:", movieId);
      const externalMovie = await moviesService.fetchMovieById(movieId);
      if (!externalMovie) {
        logger.warn(`[GraphQL] Movie ${movieId} not found in external service`);
        throw new Error("Movie not found in Movies service");
      }

      playlist.mainMovie = {
        id: externalMovie._id,
        title: externalMovie.title,
        duration: externalMovie.duration,
        director: externalMovie.director,
        poster: externalMovie.image
      };

      playlist.duration += externalMovie.duration;

      await playlist.save();
      
      logger.info(`[GraphQL] Movie successfully added to playlist ${playlistId}`);
      return await playlist.populate("order");

    } catch (error) {
      logger.error(`[GraphQL] Error in addMovieToPlaylist: ${error.message}`);
      throw error;
    }
  },

  addAdToPlaylist: async ({ playlistId, adId }) => {
    logger.info(`[GraphQL] Adding Ad ${adId} to playlist ${playlistId}`);

    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new Error("Playlist not found");

      const ad = await Ad.findById(adId);
      if (!ad) throw new Error("Ad not found in local DB");

      playlist.ads.push(adId);
      playlist.order.push(adId);
      playlist.duration += ad.duration;

      await playlist.save();
      
      logger.info(`[GraphQL] Ad added successfully.`);
      return await playlist.populate("order");

    } catch (error) {
      logger.error(`[GraphQL] Error in addAdToPlaylist: ${error.message}`);
      throw error;
    }
  },

  reorderPlaylist: async ({ playlistId, adId, newPosition }) => {
    logger.info(`[GraphQL] Moving Ad ${adId} to position ${newPosition} in playlist ${playlistId}`);

    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new Error("Playlist not found");

      // 1. Find current Ad position
      const currentIndex = playlist.order.findIndex(item => item.toString() === adId);

      if (currentIndex === -1) {
        throw new Error("This Ad does not exist in this playlist.");
      }

      // 2. Validate if new position is valid
      if (newPosition < 0 || newPosition >= playlist.order.length) {
        throw new Error(`Invalid position. Must be between 0 and ${playlist.order.length - 1}`);
      }

      // 3. Remove Ad from old position
      const [movedAd] = playlist.order.splice(currentIndex, 1);

      // 4. Insert Ad at new position
      playlist.order.splice(newPosition, 0, movedAd);

      await playlist.save();
      
      logger.info(`[GraphQL] Reordering completed.`);
      return await playlist.populate("order");

    } catch (error) {
      logger.error(`[GraphQL] Error in reorderPlaylist: ${error.message}`);
      throw error;
    }
  }
};

module.exports = { schema, root };