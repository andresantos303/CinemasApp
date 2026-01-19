module.exports = (req, res, next) => {
    // 1. Get the ID that Nginx extracted for us
    const userId = req.headers['x-user-id'];

    // 2. If it's missing, someone tried to skip the Gateway!
    if (!userId) {
        return res.status(403).json({ error: "Direct access forbidden. Use Gateway." });
    }

    // 3. Attach it to the request so your Controller can use it
    req.user = { id: userId };
    
    next();
};