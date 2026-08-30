const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = {
    generateToken,
    verifyToken
};
