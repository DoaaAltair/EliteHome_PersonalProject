const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "secret123";

router.post("/register", async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password)
            return res.status(400).json({ message: "Missing fields" });

        const [exists] = await db.execute(
            "SELECT id FROM users WHERE username = ?",
            [username]
        );
        if (exists.length)
            return res.status(400).json({ message: "User already exists" });

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

router.post("/login", async (req, res) => {
    try {
        // Ensure we always return JSON, even on errors
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({ message: "Missing fields" });
        }

        console.log(`🔍 Login attempt for user: ${username}`);

        // Test database connection first
        try {
            await db.query("SELECT 1");
        } catch (dbTestError) {
            console.error("❌ Database connection test failed:", dbTestError);
            return res.status(500).json({
                message: "Database connection failed",
                error: process.env.NODE_ENV !== 'production' ? dbTestError.message : undefined
            });
        }

        const [rows] = await db.execute(
            "SELECT id, username, password, role, is_blocked FROM users WHERE username = ?",
            [username]
        );

        if (rows.length === 0) {
            console.log(`❌ User not found: ${username}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = rows[0];
        console.log(`✅ User found: ${user.username}, role: ${user.role}, blocked: ${user.is_blocked}`);

        if (user.is_blocked) {
            console.log(`🚫 User ${username} is blocked`);
            return res
                .status(403)
                .json({ message: "Your account has been blocked by an admin." });
        }

        console.log(`🔐 Checking password for user: ${username}`);
        let match = false;
        const looksHashed = typeof user.password === "string" && user.password.startsWith("$2");

        if (looksHashed) {
            match = await bcrypt.compare(password, user.password);
        } else {
            match = password === user.password;
            if (match) {
                try {
                    const upgraded = await bcrypt.hash(password, 10);
                    await db.execute("UPDATE users SET password = ? WHERE id = ?", [upgraded, user.id]);
                    user.password = upgraded;
                    console.log(`🔁 Upgraded legacy password hash for user: ${username}`);
                } catch (hashErr) {
                    console.warn(`⚠️ Failed upgrading password for ${username}:`, hashErr?.message);
                }
            }
        }

        console.log(`🔐 Password match result: ${match}`);
        if (!match) {
            console.log(`❌ Password mismatch for user: ${username}`);
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log(`✅ Login successful for user: ${username}`);

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
        console.error("Error details:", {
            message: err.message,
            code: err.code,
            name: err.name
        });
        res.status(500).json({
            message: "Server error",
            error: process.env.NODE_ENV !== 'production' ? err.message : undefined
        });
    }
});

router.get("/check", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });

        const decoded = jwt.verify(token, SECRET);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, message: "Invalid or expired token" });
    }
});

module.exports = router;
