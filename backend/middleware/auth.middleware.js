const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token missing or invalid format'
        });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: 'Token expired or signature invalid'
        });
    }

    req.user = decoded;
    next();
}

module.exports = authenticate;
