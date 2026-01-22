const jwt = require("jsonwebtoken");
const logger = require("./logger");


exports.verifyAdmin = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader) {
    logger.warn("Attempt to modify playlists without token.");
    return res.status(403).json({ message: "Token not provided" });
  }

  try {
    const token = tokenHeader.split(" ")[1] || tokenHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "admin") {
      logger.warn(`Access denied: User ${decoded.id} attempted to modify playlists.`);
      return res.status(401).json({ message: "Access denied: Admin required" });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    logger.warn(`Invalid token in Playlists service: ${error.message}`);
    return res.status(401).json({ message: "Invalid token" });
  }
};