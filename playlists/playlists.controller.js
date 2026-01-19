const playlistsService = require('./playlists.service');

exports.getAllPlaylists = async (req, res) => {
    try {
        const playlists = await playlistsService.getAllPlaylists();
        res.json(playlists);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.getPlaylistById = async (req, res) => {
    try {
        const playlist = await playlistsService.getPlaylistById(req.params.id);
        res.json(playlist);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.createPlaylist = async (req, res) => {
    try {
        const playlist = await playlistsService.createPlaylist(req.body);
        res.status(201).json(playlist);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.updatePlaylist = async (req, res) => {
    try {
        const updated = await playlistsService.updatePlaylist(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        await playlistsService.deletePlaylist(req.params.id);
        res.json({ message: 'Playlist removida' });
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

// Ads
exports.createAd = async (req, res) => {
    try {
        const ad = await playlistsService.createAd(req.body);
        res.status(201).json(ad);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};

exports.getAllAds = async (req, res) => {
    try {
        const ads = await playlistsService.getAllAds();
        res.json(ads);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message || error });
    }
};
