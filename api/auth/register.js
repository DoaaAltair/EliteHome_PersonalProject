// POST /api/auth/register
const db = require("../_lib/db");
const bcrypt = require("bcryptjs");

module.exports = async function handler(req, res) {
    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { username, password, role } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        const [exists] = await db.execute(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );

        if (exists.length) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            "INSERT INTO users (username, password, role, is_blocked) VALUES (?, ?, ?, ?)",
            [username, hashed, role || "staff", 0]
        );

        res.status(201).json({
            message: "User created successfully",
            id: result.insertId,
        });
    } catch (err) {
        console.error("❌ Register error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

