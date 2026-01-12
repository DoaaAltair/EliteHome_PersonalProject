const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/test", async (req, res) => {
    try {
        res.json({ message: "Admin routes are working!", timestamp: new Date().toISOString() });
    } catch (err) {
        console.error("❌ Error in admin test:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/users", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT id, username, role, is_blocked, created_at FROM users ORDER BY created_at DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching users:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch("/users/:id/block", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing user ID" });

        await db.execute("UPDATE users SET is_blocked = 1 WHERE id = ?", [id]);
        res.json({ message: "User blocked successfully" });
    } catch (err) {
        console.error("❌ Error blocking user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.patch("/users/:id/unblock", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing user ID" });

        await db.execute("UPDATE users SET is_blocked = 0 WHERE id = ?", [id]);
        res.json({ message: "User unblocked successfully" });
    } catch (err) {
        console.error("❌ Error unblocking user:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/notifications", async (req, res) => {
    try {
        const { title, message, apartment_tag } = req.body;
        if (!message) return res.status(400).json({ message: "Message is required" });

        try {
            const [result] = await db.execute(
                "INSERT INTO notifications (title, message, apartment_tag) VALUES (?, ?, ?)",
                [title || null, message, apartment_tag || null]
            );
            res.status(201).json({
                message: "Notification sent successfully",
                id: result.insertId
            });
        } catch (titleError) {
            if (titleError.code === 'ER_BAD_FIELD_ERROR') {
                const [result] = await db.execute(
                    "INSERT INTO notifications (message, apartment_tag) VALUES (?, ?)",
                    [message, apartment_tag || null]
                );
                res.status(201).json({
                    message: "Notification sent successfully",
                    id: result.insertId
                });
            } else {
                throw titleError;
            }
        }
    } catch (err) {
        console.error("❌ Error sending notification:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/notifications", async (req, res) => {
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

router.delete("/notifications/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing notification ID" });

        const [result] = await db.execute("DELETE FROM notifications WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ message: "Notification deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting notification:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/assign-owner", async (req, res) => {
    try {
        const { owner_name, apartment_ids } = req.body;

        if (!owner_name || !Array.isArray(apartment_ids) || apartment_ids.length === 0) {
            return res.status(400).json({ message: "Missing owner_name or apartment list" });
        }

        const safeOwner = owner_name.trim();
        if (safeOwner.length < 2) {
            return res.status(400).json({ message: "Invalid owner name" });
        }

        const updates = apartment_ids.map(id =>
            db.execute("UPDATE apartments SET owner_name = ? WHERE id = ?", [safeOwner, id])
        );
        await Promise.all(updates);

        res.json({ message: `Owner '${safeOwner}' assigned to ${apartment_ids.length} apartments` });
    } catch (err) {
        console.error("❌ Error assigning owner:", err);
        res.status(500).json({ message: "Server error while assigning owner" });
    }
});

router.get("/owners", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT id, username, created_at FROM users WHERE role = 'owner' ORDER BY created_at DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching owners:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/owners/:owner_name/apartments", async (req, res) => {
    try {
        const { owner_name } = req.params;
        
        const [rows] = await db.execute(`
            SELECT id, number, type, status, price, owner_name 
            FROM apartments 
            WHERE owner_name = ? 
            ORDER BY number ASC
        `, [owner_name]);
        
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching owner apartments:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/owners/assignments", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                owner_name,
                COUNT(*) as total_apartments,
                SUM(CASE WHEN status = 'Rented' THEN 1 ELSE 0 END) as rented_count,
                SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_count,
                COALESCE(SUM(price * 12), 0) as yearly_income
            FROM apartments 
            WHERE owner_name IS NOT NULL AND owner_name != ''
            GROUP BY owner_name
            ORDER BY owner_name ASC
        `);
        
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching owner assignments:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/invoices", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT invoices.*, a.number AS apartment_number
            FROM invoices
            JOIN apartments a ON invoices.apartment_id = a.id
            ORDER BY invoices.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching invoices:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/finances", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT f.*, a.number AS apartment_number
            FROM finances f
            JOIN apartments a ON f.apartment_id = a.id
            ORDER BY f.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching finances:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/stats", async (req, res) => {
    try {
        const [userStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_blocked = 1 THEN 1 ELSE 0 END) as blocked_users,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'owner' THEN 1 ELSE 0 END) as owner_count,
                SUM(CASE WHEN role = 'staff' THEN 1 ELSE 0 END) as staff_count
            FROM users
        `);

        const [apartmentStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_apartments,
                SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) as available_apartments,
                SUM(CASE WHEN status = 'Rented' THEN 1 ELSE 0 END) as rented_apartments
            FROM apartments
        `);

        const [invoiceStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_invoices,
                SUM(total) as total_revenue
            FROM invoices
        `);

        res.json({
            users: userStats[0],
            apartments: apartmentStats[0],
            invoices: invoiceStats[0]
        });
    } catch (err) {
        console.error("❌ Error fetching dashboard stats:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
