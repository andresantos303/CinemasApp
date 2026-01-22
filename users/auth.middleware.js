// --- Middleware --- 
exports.verifyAdmin = (req, res, next) => {
    const tokenHeader = req.headers["authorization"];

    if (!tokenHeader) {
        logger.warn("Access denied: Token not provided.");
        return res.status(403).json({ message: "Token not provided" });
    }

    try {
        const token = tokenHeader.split(" ")[1] || tokenHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== "admin") {
            logger.warn(
                `Access denied: User ${decoded.id} attempted to access admin route.`
            );
            return res.status(401).json({ message: "Access denied: Admin required" });
        }

        req.userId = decoded.id; 
        next();
    } catch (error) {
        logger.warn(`Invalid or expired token: ${error.message}`);
        return res.status(401).json({ message: "Invalid token" });
    }
};