const express = require("express");
const bcrypt = require("bcryptjs"); // ✅ serverless-safe
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
    console.error("❌ JWT_SECRET is not set");
}

// =====================
// REGISTER
// =====================
router.post("/register", async (req, res) => {
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
});

// =====================
// LOGIN
// =====================
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

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
        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV !== "production" ? err.message : undefined,
        });
    }
});

// =====================
// TOKEN CHECK
// =====================
router.get("/check", (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, SECRET);
        res.json({ valid: true, user: decoded });
    } catch {
        res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
});

module.exports = router;
