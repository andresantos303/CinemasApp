const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    advertiser: { type: String, required: true },
    duration: { type: Number, required: true }, // em segundos
    url: { type: String }, // link para o vídeo do ad
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", AdSchema);