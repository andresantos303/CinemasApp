const mongoose = require('mongoose');

const AdSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },       // link do vídeo
    duration: { type: Number, required: true },  // duração em segundos
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Ad', AdSchema);