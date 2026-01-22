const { buildSchema } = require("graphql");
const Playlist = require("./models/playlists.model");
const Ad = require("./models/ads.model");
const moviesService = require("./movies.service");
const logger = require("./logger"); // <--- 1. Importar o logger

const schema = buildSchema(`
  type MovieSnapshot {
    id: String
    title: String
    duration: Int
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
    # owner_id existe na BD mas não é exposto aqui
    duration: Int
    mainMovie: MovieSnapshot 
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
      logger.info(`[GraphQL] A procurar playlist: ${id}`);
      const result = await Playlist.findById(id).populate("order");
      if (!result) logger.warn(`[GraphQL] Playlist ${id} não encontrada.`);
      return result;
    } catch (error) {
      logger.error(`[GraphQL] Erro na query playlist: ${error.message}`);
      throw error;
    }
  },
  
  playlists: async () => {
    try {
      logger.info(`[GraphQL] A listar todas as playlists`);
      return await Playlist.find({}).populate("order");
    } catch (error) {
      logger.error(`[GraphQL] Erro na query playlists: ${error.message}`);
      throw error;
    }
  },

  // --- MUTATIONS ---

  createPlaylist: async ({ title, description }, context) => {
    // Verificar autenticação
    if (!context.userId) {
      const msg = "Utilizador não autenticado (Contexto vazio)";
      logger.warn(`[GraphQL] Bloqueado: ${msg}`);
      throw new Error(msg);
    }

    logger.info(`[GraphQL] User ${context.userId} a criar playlist: '${title}'`);

    try {
      const newPlaylist = new Playlist({ 
        title, 
        description, 
        owner_id: context.userId
      });
      
      await newPlaylist.save();
      
      logger.info(`[GraphQL] Sucesso: Playlist criada com ID ${newPlaylist._id}`);
      return newPlaylist;

    } catch (error) {
      logger.error(`[GraphQL] Erro ao criar playlist: ${error.message}`);
      throw error;
    }
  },

  deletePlaylist: async ({ id }) => {
    logger.info(`[GraphQL] A tentar remover playlist: ${id}`);
    try {
      const deleted = await Playlist.findByIdAndDelete(id);
      if (!deleted) {
        logger.warn(`[GraphQL] Falha ao remover: Playlist ${id} não encontrada`);
        throw new Error("Playlist não encontrada");
      }
      
      logger.info(`[GraphQL] Playlist removida com sucesso: ${id}`);
      return "Playlist removida com sucesso";
    } catch (error) {
      logger.error(`[GraphQL] Erro ao remover playlist: ${error.message}`);
      throw error;
    }
  },

  addMovieToPlaylist: async ({ playlistId, movieId }) => {
    logger.info(`[GraphQL] A adicionar filme ${movieId} à playlist ${playlistId}`);
    
    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new Error("Playlist não encontrada");

      // Buscar filme externo
      const externalMovie = await moviesService.fetchMovieById(movieId);
      console.log(externalMovie);
      if (!externalMovie) {
        logger.warn(`[GraphQL] Filme ${movieId} não encontrado no serviço externo`);
        throw new Error("Filme não encontrado no serviço de Movies");
      }

      playlist.mainMovie = {
        id: externalMovie._id,
        title: externalMovie.title,
        duration: externalMovie.duration,
        poster: externalMovie.image
      };

      playlist.duration += externalMovie.duration;

      await playlist.save();
      
      logger.info(`[GraphQL] Filme adicionado com sucesso à playlist ${playlistId}`);
      return await playlist.populate("order");

    } catch (error) {
      logger.error(`[GraphQL] Erro em addMovieToPlaylist: ${error.message}`);
      throw error;
    }
  },

  addAdToPlaylist: async ({ playlistId, adId }) => {
    logger.info(`[GraphQL] A adicionar Ad ${adId} à playlist ${playlistId}`);

    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new Error("Playlist não encontrada");

      const ad = await Ad.findById(adId);
      if (!ad) throw new Error("Ad não encontrado na BD local");

      playlist.ads.push(adId);
      playlist.order.push(adId);
      playlist.duration += ad.duration;

      await playlist.save();
      
      logger.info(`[GraphQL] Ad adicionado com sucesso.`);
      return await playlist.populate("order");

    } catch (error) {
      logger.error(`[GraphQL] Erro em addAdToPlaylist: ${error.message}`);
      throw error;
    }
  },

  reorderPlaylist: async ({ playlistId, adId, newPosition }) => {
    logger.info(`[GraphQL] A mover Ad ${adId} para posição ${newPosition} na playlist ${playlistId}`);

    try {
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) throw new Error("Playlist não encontrada");

      // 1. Encontrar a posição atual do Ad
      const currentIndex = playlist.order.findIndex(item => item.toString() === adId);

      if (currentIndex === -1) {
        throw new Error("Este Ad não existe nesta playlist.");
      }

      // 2. Validar se a nova posição é válida
      if (newPosition < 0 || newPosition >= playlist.order.length) {
        throw new Error(`Posição inválida. Deve ser entre 0 e ${playlist.order.length - 1}`);
      }

      // 3. Remover o Ad da posição antiga
      const [movedAd] = playlist.order.splice(currentIndex, 1);

      // 4. Inserir o Ad na nova posição
      playlist.order.splice(newPosition, 0, movedAd);

      await playlist.save();
      
      logger.info(`[GraphQL] Reordenação concluída.`);
      return await playlist.populate("order");

    } catch (error) {
      logger.error(`[GraphQL] Erro em reorderPlaylist: ${error.message}`);
      throw error;
    }
  }
};

module.exports = { schema, root };