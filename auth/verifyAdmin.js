const jwt = require('jsonwebtoken');

// Define the function clearly
const verifyAdmin = (req, res) => {
    const tokenHeader = req.headers['authorization'];
    if (!tokenHeader) return res.status(401).end();

    try {
        const token = tokenHeader.split(' ')[1] || tokenHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'admin') {
            return res.status(403).end();
        }

        res.setHeader('X-User-Id', decoded.id);
        return res.status(200).end();
    } catch (err) {
        return res.status(401).end();
    }
};

// Export the function
module.exports = verifyAdmin;