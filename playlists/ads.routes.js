const express = require("express");
const router = express.Router();
const controller = require("./ads.controller");
const { verifyAdmin } = require("./auth.middleware");

// --- Rotas Públicas ---

router.get("/", (req, res) => {
  // #swagger.tags = ['Ads']
  // #swagger.summary = 'Listar anúncios'
  // #swagger.description = 'Retorna todos os anúncios ou filtra por anunciante.'
  /* #swagger.parameters['advertiser'] = { 
       description: 'Filtrar por nome do anunciante (ex: Coca-Cola)', 
       type: 'string' 
  } */
  controller.getAllAds(req, res);
});

router.get("/:id", (req, res) => {
  // #swagger.tags = ['Ads']
  // #swagger.summary = 'Obter anúncio por ID'
  /* #swagger.parameters['id'] = { 
       description: 'ID do anúncio', 
       type: 'string',
       required: true
  } */
  controller.getAdById(req, res);
});

// --- Rotas de Escrita (Protegidas) ---

router.post("/", verifyAdmin, (req, res) => {
  // #swagger.tags = ['Ads']
  // #swagger.summary = 'Criar anúncio (Admin)'
  // #swagger.description = 'Adiciona um novo anúncio à base de dados. Requer token de Admin.'
  // #swagger.security = [{ "bearerAuth": [] }]
  
  /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: { 
                    $title: "Promoção Verão",
                    $advertiser: "Marca X",
                    $duration: 15,
                    $url: "https://exemplo.com/video.mp4"
                } 
            }
        }
    } */
  controller.createAd(req, res);
});

router.delete("/:id", verifyAdmin, (req, res) => {
  // #swagger.tags = ['Ads']
  // #swagger.summary = 'Remover anúncio (Admin)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = { 
       description: 'ID do anúncio a remover', 
       type: 'string',
       required: true
  } */
  controller.deleteAd(req, res);
});

module.exports = router;