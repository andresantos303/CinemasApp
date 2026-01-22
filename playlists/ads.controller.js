const Ad = require("./models/ads.model");
const logger = require("./logger");

exports.getAllAds = async (req, res) => {
  try {
    // Admin might want to see all, or filter by advertiser
    const { advertiser } = req.query;
    const query = advertiser ? { advertiser } : {};

    const ads = await Ad.find(query);
    res.json(ads);
  } catch (error) {
    logger.error(`Error listing ads: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.getAdById = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });
    res.json(ad);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAd = async (req, res) => {
  try {
    const { title, advertiser, duration, url } = req.body;

    // Basic validation
    if (!title || !advertiser || !duration) {
      return res.status(400).json({ message: "Title, advertiser, and duration are required." });
    }

    const newAd = new Ad({ title, advertiser, duration, url });
    await newAd.save();

    logger.info(`New Ad created: ${title} (${duration}s)`);
    res.status(201).json(newAd);
  } catch (error) {
    logger.error(`Error creating ad: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedAd = await Ad.findByIdAndDelete(id);

    if (!deletedAd) return res.status(404).json({ message: "Ad not found" });

    logger.info(`Ad removed: ${id}`);
    res.json({ message: "Ad removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};