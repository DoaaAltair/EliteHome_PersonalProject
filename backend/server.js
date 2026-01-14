require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const { verifyToken } = require("./middleware/verifyToken");
const { requireRole } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/auth");
const invoiceRoutes = require("./routes/invoices");
const financeRoutes = require("./routes/finances");
const adminRoutes = require("./routes/adminRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const notificationRoutes = require("./routes/notifications");

app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", verifyToken, requireRole("admin"), adminRoutes);
app.use("/api/owner", verifyToken, requireRole("owner"), ownerRoutes);
app.use("/api/invoices", verifyToken, invoiceRoutes);
app.use("/api/finances", verifyToken, financeRoutes);

app.use("/uploads", express.static("uploads"));

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

app.get("/", (req, res) => {
    res.send("Elite Home backend is running 🚀");
});

app.get("/api", (req, res) => {
    res.json({ status: "API root works" });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        database: "connected"
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

db.query("SELECT 1")
    .then(() => console.log("✅ Database connected successfully"))
    .catch(err => console.error("❌ Database connection error:", err));

module.exports = app;
