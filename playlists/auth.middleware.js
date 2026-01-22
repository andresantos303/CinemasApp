const jwt = require("jsonwebtoken");
const logger = require("./logger");


exports.verifyAdmin = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader) {
    logger.warn("Tentativa de alteração de playlists sem token.");
    return res.status(403).json({ message: "Token não fornecido" });
  }

  try {
    const token = tokenHeader.split(" ")[1] || tokenHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "admin") {
      logger.warn(`Acesso negado: User ${decoded.id} tentou alterar playlists.`);
      return res.status(401).json({ message: "Acesso negado: Requer Admin" });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    logger.warn(`Token inválido no serviço de Playlists: ${error.message}`);
    return res.status(401).json({ message: "Token inválido" });
  }
};