const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    ads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],  // lista de ads
    mainMovieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    order: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }], // ordem de reprodução dos ads
    duration: { type: Number, default: 0 } // duração total em minutos
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);