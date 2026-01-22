const express = require("express");
const router = express.Router();
const controller = require("./ads.controller");
const verifyAdmin = require("./auth.middleware").verifyAdmin;

router.get("/", (req, res) => {
  controller.getAllAds(req, res);
});

router.get("/:id", (req, res) => {
  controller.getAdById(req, res);
});

// --- Rotas de Escrita (Protegidas) ---

router.post("/", verifyAdmin, (req, res) => {
  controller.createAd(req, res);
});

router.delete("/:id", verifyAdmin, (req, res) => {
  controller.deleteAd(req, res);
});

module.exports = router;