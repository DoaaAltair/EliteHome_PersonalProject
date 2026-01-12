const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
    try {
        try {
            const [rows] = await db.execute(
                "SELECT id, title, message, apartment_tag, created_at FROM notifications ORDER BY created_at DESC"
            );
            res.json(rows);
        } catch (titleError) {
            if (titleError.code === 'ER_BAD_FIELD_ERROR') {
                const [rows] = await db.execute(
                    "SELECT id, message, apartment_tag, created_at FROM notifications ORDER BY created_at DESC"
                );
                const rowsWithTitle = rows.map(row => ({ ...row, title: null }));
                res.json(rowsWithTitle);
            } else {
                throw titleError;
            }
        }
    } catch (err) {
        console.error("❌ Error fetching notifications:", err);
        res.json([]);
    }
});

router.get("/apartment/:tag", async (req, res) => {
    try {
        const { tag } = req.params;
        try {
            const [rows] = await db.execute(
                "SELECT id, title, message, apartment_tag, created_at FROM notifications WHERE apartment_tag = ? ORDER BY created_at DESC",
                [tag]
            );
            res.json(rows);
        } catch (titleError) {
            if (titleError.code === 'ER_BAD_FIELD_ERROR') {
                const [rows] = await db.execute(
                    "SELECT id, message, apartment_tag, created_at FROM notifications WHERE apartment_tag = ? ORDER BY created_at DESC",
                    [tag]
                );
                const rowsWithTitle = rows.map(row => ({ ...row, title: null }));
                res.json(rowsWithTitle);
            } else {
                throw titleError;
            }
        }
    } catch (err) {
        console.error("❌ Error fetching apartment notifications:", err);
        res.json([]);
    }
});

module.exports = router;
