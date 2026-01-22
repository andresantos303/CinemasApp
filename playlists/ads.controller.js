const Ad = require("./models/ads.model");
const logger = require("./logger");

exports.getAllAds = async (req, res) => {
  try {
    // Admin pode querer ver todos, ou filtrar por anunciante
    const { advertiser } = req.query;
    const query = advertiser ? { advertiser } : {};

    const ads = await Ad.find(query);
    res.json(ads);
  } catch (error) {
    logger.error(`Erro ao listar ads: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad não encontrado" });
    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const { title, advertiser, duration, url } = req.body;

    // Validação básica
    if (!title || !advertiser || !duration) {
      return res.status(400).json({ message: "Título, anunciante e duração são obrigatórios." });
    }

    const newAd = new Ad({ title, advertiser, duration, url });
    await newAd.save();

    logger.info(`Novo Ad criado: ${title} (${duration}s)`);
    res.status(201).json(newAd);
  } catch (error) {
    logger.error(`Erro ao criar ad: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAd = await Ad.findByIdAndDelete(id);

    if (!deletedAd) return res.status(404).json({ message: "Ad não encontrado" });

    logger.info(`Ad removido: ${id}`);
    res.json({ message: "Ad removido com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};