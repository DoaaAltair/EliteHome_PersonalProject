// Vercel serverless function - exports Express app
const express = require("express");
const cors = require("cors");
const path = require("path");

// Import backend modules
const db = require("../backend/db");
const { verifyToken } = require("../backend/middleware/verifyToken");
const { requireRole } = require("../backend/middleware/authMiddleware");

const authRoutes = require("../backend/routes/auth");
const invoiceRoutes = require("../backend/routes/invoices");
const financeRoutes = require("../backend/routes/finances");
const adminRoutes = require("../backend/routes/adminRoutes");
const ownerRoutes = require("../backend/routes/ownerRoutes");
const notificationRoutes = require("../backend/routes/notifications");

const app = express();

// CORS configuration for Vercel
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['*'];

app.use(cors({
    origin: function (origin, callback) {
        if (allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes - Note: Vercel rewrites already add /api prefix, but routes expect it
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", verifyToken, requireRole("admin"), adminRoutes);
app.use("/api/owner", verifyToken, requireRole("owner"), ownerRoutes);
app.use("/api/invoices", verifyToken, invoiceRoutes);
app.use("/api/finances", verifyToken, financeRoutes);

// Also handle routes without /api prefix (in case Vercel doesn't add it)
app.use("/auth", authRoutes);
app.use("/notifications", notificationRoutes);
app.use("/admin", verifyToken, requireRole("admin"), adminRoutes);
app.use("/owner", verifyToken, requireRole("owner"), ownerRoutes);
app.use("/invoices", verifyToken, invoiceRoutes);
app.use("/finances", verifyToken, financeRoutes);

// Static files (uploads) - Note: Vercel has limited file system, consider using cloud storage
// app.use("/uploads", express.static(path.join(__dirname, "../backend/uploads")));

// Apartment routes
app.get("/api/apartments", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT * FROM apartments ORDER BY id DESC"
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching apartments:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/apartments/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute("SELECT * FROM apartments WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Apartment not found" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching apartment:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/apartments", verifyToken, async (req, res) => {
    try {
        const { type, employee, owner_name, number, description, status, household } = req.body;

        if (!type || !employee || !number) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const [result] = await db.execute(
            `INSERT INTO apartments (type, employee, owner_name, number, description, status, household)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [type, employee, owner_name || null, number, description, status, household]
        );

        res.status(201).json({ message: "Apartment added", id: result.insertId });
    } catch (err) {
        console.error("Error creating apartment:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.delete("/api/apartments/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing id" });

        const [result] = await db.execute("DELETE FROM apartments WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Apartment not found" });
        }
        res.json({ message: "Apartment deleted" });
    } catch (err) {
        console.error("Error deleting apartment:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.put("/api/apartments/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing id" });

        const allowed = ["type", "employee", "number", "description", "status", "household", "photo"];
        const payload = req.body || {};

        const fields = Object.keys(payload).filter(
            (k) => allowed.includes(k) && payload[k] !== undefined
        );
        if (fields.length === 0) return res.status(400).json({ message: "No valid fields to update" });

        const sets = fields.map((k) => `${k} = ?`).join(", ");
        const values = fields.map((k) => payload[k]);
        values.push(id);

        await db.execute(`UPDATE apartments SET ${sets} WHERE id = ?`, values);

        const [rows] = await db.execute("SELECT * FROM apartments WHERE id = ?", [id]);
        if (!rows.length) return res.status(404).json({ message: "Apartment not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Error updating apartment:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.patch("/api/apartments/:id/household-done", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { done } = req.body || {};

        if (!id || typeof done === "undefined") {
            return res.status(400).json({ message: "Missing id or done flag" });
        }

        const [rows] = await db.execute("SELECT household FROM apartments WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Apartment not found" });

        const current = rows[0].household || "";
        const hasCheck = current.trim().startsWith("✅");
        let updated = current;
        if (done && !hasCheck) {
            updated = `✅ ${current}`.trim();
        } else if (!done && hasCheck) {
            updated = current.replace(/^\s*✅\s*/u, "").trim();
        }

        await db.execute("UPDATE apartments SET household = ? WHERE id = ?", [updated, id]);

        const [after] = await db.execute("SELECT * FROM apartments WHERE id = ?", [id]);
        res.json(after[0]);
    } catch (err) {
        console.error("Error updating household status:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Export for Vercel serverless
// Vercel automatically handles Express apps exported from api/ directory
module.exports = app;

