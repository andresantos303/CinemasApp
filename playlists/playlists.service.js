const Playlist = require('./playlists.model');
const Ad = require('./ads.model');
const logger = require('./logger');
const mongoose = require('mongoose');

// CRUD Playlists
async function getAllPlaylists() {
    return Playlist.find().populate('ads').populate('mainMovieId');
}

async function getPlaylistById(id) {
    const playlist = await Playlist.findById(id).populate('ads').populate('mainMovieId');
    if (!playlist) throw { status: 404, message: 'Playlist não encontrada' };
    return playlist;
}

async function createPlaylist(data) {
    const playlist = new Playlist(data);
    await playlist.save();
    logger.info(`Playlist criada: ${playlist.title}`);
    return playlist;
}

async function updatePlaylist(id, data) {
    const updated = await Playlist.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw { status: 404, message: 'Playlist não encontrada' };
    logger.info(`Playlist atualizada: ${id}`);
    return updated;
}

async function deletePlaylist(id) {
    const deleted = await Playlist.findByIdAndDelete(id);
    if (!deleted) throw { status: 404, message: 'Playlist não encontrada' };
    logger.info(`Playlist removida: ${id}`);
    return deleted;
}

// CRUD Ads
async function createAd(data) {
    const ad = new Ad(data);
    await ad.save();
    logger.info(`Ad criado: ${ad.title}`);
    return ad;
}

async function getAllAds() {
    return Ad.find();
}

module.exports = {
    getAllPlaylists,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    createAd,
    getAllAds
};
