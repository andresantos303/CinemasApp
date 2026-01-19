const jwt = require('jsonwebtoken');

module.exports = function verifyAdmin(req, res) {
    const tokenHeader = req.headers['authorization'];

    if (!tokenHeader) {
        return res.status(401).end();
    }

    try {
        const token = tokenHeader.split(' ')[1] || tokenHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'admin') {
            return res.status(403).end();
        }

        // Pass user info to Nginx
        res.setHeader('X-User-Id', decoded.id);
        res.status(200).end();
    } catch {
        return res.status(401).end();
    }
};