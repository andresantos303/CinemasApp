const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    director: { type: String, required: true },
    category: { type: String, required: true }, // ex: Ação, Drama
    duration: { type: Number, required: true }, // em minutos
    releaseDate: { type: Date },
    image: { type: String } // URL da imagem
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', MovieSchema);