const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    owner_id: { type: String, required: true },
    status: { type: String, enum: ["public", "private"], default: "public" },
    
    // Ads continuam locais (assumindo que pertencem a este serviço ou replicados)
    ads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ad" }],
    
    // ALTERAÇÃO: Em vez de ref, guardamos os dados essenciais (Snapshot)
    mainMovie: { 
      id: { type: String }, // ID original do outro serviço
      title: { type: String },
      duration: { type: Number },
      poster: { type: String }
    },
    
    order: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ad" }],
    
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Playlist", PlaylistSchema);