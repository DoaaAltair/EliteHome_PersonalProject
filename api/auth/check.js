// GET /api/auth/check
const { verifyToken } = require("../_lib/auth");

module.exports = async function handler(req, res) {
    // Only allow GET
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const user = verifyToken(req);
        if (!user) {
            return res.status(401).json({ valid: false, message: "Invalid or expired token" });
        }

        res.json({ valid: true, user });
    } catch (err) {
        console.error("❌ Token check error:", err);
        res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
}

