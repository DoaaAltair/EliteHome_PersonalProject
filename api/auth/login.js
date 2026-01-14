// POST /api/auth/login
const db = require("../_lib/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

module.exports = async function handler(req, res) {
    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    // Check for required environment variables
    if (!SECRET) {
        console.error("❌ JWT_SECRET is not set");
        return res.status(500).json({
            message: "Server configuration error",
            error: "JWT_SECRET environment variable is missing"
        });
    }

    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        // Test database connection first
        if (!db || typeof db.execute !== 'function') {
            console.error("❌ Database connection not available");
            console.error("   db type:", typeof db);
            console.error("   db.execute type:", typeof db?.execute);
            return res.status(500).json({
                message: "Database connection error",
                error: "Database pool is not properly initialized"
            });
        }

        console.log("✅ Database connection available, executing query...");
        console.log("   DATABASE_URL exists:", !!process.env.DATABASE_URL);

        const [rows] = await db.execute(
            "SELECT id, username, password, role, is_blocked FROM users WHERE username = ? LIMIT 1",
            [username]
        );

        if (!rows.length) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = rows[0];

        if (user.is_blocked) {
            return res
                .status(403)
                .json({ message: "Your account has been blocked by an admin." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
            },
            SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            message: "Login successful",
            username: user.username,
            role: user.role,
            token,
        });
    } catch (err) {
        console.error("❌ Login error:", err);
        console.error("Error stack:", err.stack);
        console.error("Error code:", err.code);
        console.error("DATABASE_URL exists:", !!process.env.DATABASE_URL);

        // Return more detailed error for debugging
        // Always include error message in production for better debugging
        res.status(500).json({
            message: "Server error",
            error: err.message || "Unknown error",
            code: err.code,
            // Show stack trace in development or if DEBUG is enabled
            details: (process.env.NODE_ENV !== "production" || process.env.DEBUG === "true")
                ? err.stack
                : undefined
        });
    }
};
