const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const playlistsService = require('./playlists.service');
const { verifyAdmin } = require('./auth.middleware');

// --- Schema GraphQL ---
const schema = buildSchema(`
  type Ad {
    id: ID!
    title: String!
    url: String!
    duration: Int!
  }

  type Playlist {
    id: ID!
    title: String!
    description: String
    ads: [Ad]
    mainMovieId: ID!
    duration: Int
  }

  type Query {
    playlists: [Playlist]
    playlist(id: ID!): Playlist
    ads: [Ad]
  }

  type Mutation {
    createPlaylist(title: String!, description: String, mainMovieId: ID!, ads: [ID]): Playlist
    updatePlaylist(id: ID!, title: String, description: String, mainMovieId: ID, ads: [ID]): Playlist
    deletePlaylist(id: ID!): String
    createAd(title: String!, url: String!, duration: Int!): Ad
  }
`);

const root = {
    playlists: async () => await playlistsService.getAllPlaylists(),
    playlist: async ({ id }) => await playlistsService.getPlaylistById(id),
    ads: async () => await playlistsService.getAllAds(),

    createPlaylist: async (args, req) => {
        await new Promise((resolve, reject) => verifyAdmin(req, {}, (err) => err ? reject(err) : resolve()));
        return playlistsService.createPlaylist(args);
    },

    updatePlaylist: async (args, req) => {
        await new Promise((resolve, reject) => verifyAdmin(req, {}, (err) => err ? reject(err) : resolve()));
        return playlistsService.updatePlaylist(args.id, args);
    },

    deletePlaylist: async ({ id }, req) => {
        await new Promise((resolve, reject) => verifyAdmin(req, {}, (err) => err ? reject(err) : resolve()));
        await playlistsService.deletePlaylist(id);
        return "Playlist removida";
    },

    createAd: async (args, req) => {
        await new Promise((resolve, reject) => verifyAdmin(req, {}, (err) => err ? reject(err) : resolve()));
        return playlistsService.createAd(args);
    }
};

module.exports = (app) => {
    app.use('/graphql', (req, res) => graphqlHTTP({
        schema,
        rootValue: root,
        graphiql: true,
        context: req
    })(req, res));
};
