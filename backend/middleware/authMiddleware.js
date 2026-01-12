function requireRole(role) {
    return (req, res, next) => {
        if (req.user?.role === role) {
            next();
        } else {
            res.status(403).json({ message: "Forbidden - insufficient permissions" });
        }
    };
}

function checkRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Access denied" });
        }
        next();
    };
}

function requireAdminOrOwner() {
    return (req, res, next) => {
        if (req.user?.role === 'admin' || req.user?.role === 'owner') {
            next();
        } else {
            res.status(403).json({ message: "Access denied - admin or owner required" });
        }
    };
}

module.exports = { requireRole, checkRole, requireAdminOrOwner };
