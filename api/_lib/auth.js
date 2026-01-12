// Shared authentication utilities for serverless functions
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    console.error("❌ JWT_SECRET is not set");
}

/**
 * Verify JWT token from request headers
 * @param {Object} req - Request object
 * @returns {Object|null} Decoded token or null
 */
function verifyToken(req) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return null;
        }

        const token = authHeader.split(" ")[1] || authHeader;
        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Check if user has required role
 * @param {Object} user - User object from token
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
function hasRole(user, requiredRole) {
    if (!user || !user.role) {
        return false;
    }
    return user.role === requiredRole;
}

/**
 * Middleware function to require authentication
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Object|null} User object or null (if not authenticated)
 */
function requireAuth(req, res) {
    const user = verifyToken(req);
    if (!user) {
        res.status(401).json({ message: "Authentication required" });
        return null;
    }
    return user;
}

/**
 * Middleware function to require specific role
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} requiredRole - Required role
 * @returns {Object|null} User object or null (if not authorized)
 */
function requireRole(req, res, requiredRole) {
    const user = requireAuth(req, res);
    if (!user) {
        return null;
    }

    if (!hasRole(user, requiredRole)) {
        res.status(403).json({ message: `Access denied. Required role: ${requiredRole}` });
        return null;
    }

    return user;
}

module.exports = {
    verifyToken,
    hasRole,
    requireAuth,
    requireRole
};

