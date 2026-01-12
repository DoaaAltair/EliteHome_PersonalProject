// Vercel serverless function - exports Express app
const express = require("express");
const cors = require("cors");
const path = require("path");

// Global error handler for uncaught errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack:', error.stack);
    // Don't exit in serverless - let Vercel handle it
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    if (reason instanceof Error) {
        console.error('Stack:', reason.stack);
    }
    // Don't exit in serverless - let Vercel handle it
});

let db, verifyToken, requireRole, authRoutes, invoiceRoutes, financeRoutes, adminRoutes, ownerRoutes, notificationRoutes;

try {
    // Import backend modules with error handling
    db = require("../backend/db");
    verifyToken = require("../backend/middleware/verifyToken").verifyToken;
    requireRole = require("../backend/middleware/authMiddleware").requireRole;

    authRoutes = require("../backend/routes/auth");
    invoiceRoutes = require("../backend/routes/invoices");
    financeRoutes = require("../backend/routes/finances");
    adminRoutes = require("../backend/routes/adminRoutes");
    ownerRoutes = require("../backend/routes/ownerRoutes");
    notificationRoutes = require("../backend/routes/notifications");

    console.log("✅ All modules loaded successfully");
} catch (error) {
    console.error("❌ Error loading modules:", error);
    throw error;
}

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

// Test database connection on first request (non-blocking)
app.use(async (req, res, next) => {
    // Only test on first request to avoid overhead
    if (!app.locals.dbTested) {
        app.locals.dbTested = true; // Mark as tested to avoid multiple tests
        // Test in background, don't block request
        db.query("SELECT 1").then(() => {
            console.log("✅ Database connection verified");
        }).catch((dbError) => {
            console.error("❌ Database connection failed:");
            console.error("   Error:", dbError.message);
            console.error("   Code:", dbError.code);
            console.error("   DATABASE_URL exists:", !!process.env.DATABASE_URL);
            console.error("   DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
        });
    }
    next();
});

// Wrap all routes in error handler to prevent crashes
const wrapAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.error("Unhandled route error:", err);
            if (!res.headersSent) {
                res.status(500).json({
                    message: "Internal server error",
                    error: process.env.NODE_ENV !== 'production' ? err.message : undefined
                });
            }
        });
    };
};

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
app.get("/api/health", async (req, res) => {
    try {
        // Test database connection
        await db.query("SELECT 1");
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected"
        });
    } catch (dbError) {
        console.error("Health check - Database error:", dbError);
        res.status(500).json({
            status: "error",
            timestamp: new Date().toISOString(),
            database: "disconnected",
            error: process.env.NODE_ENV !== 'production' ? dbError.message : undefined,
            code: dbError.code
        });
    }
});

// Database test endpoint
app.get("/api/test-db", async (req, res) => {
    try {
        const hasDbUrl = !!process.env.DATABASE_URL;
        const dbUrlLength = process.env.DATABASE_URL?.length || 0;
        const hasJwtSecret = !!process.env.JWT_SECRET;

        // Try to connect
        const result = await db.query("SELECT 1 as test, NOW() as time");

        res.json({
            success: true,
            database: "connected",
            env: {
                hasDatabaseUrl: hasDbUrl,
                databaseUrlLength: dbUrlLength,
                hasJwtSecret: hasJwtSecret
            },
            queryResult: result.rows[0]
        });
    } catch (error) {
        console.error("Database test error:", error);
        res.status(500).json({
            success: false,
            database: "error",
            error: {
                message: error.message,
                code: error.code,
                name: error.name
            },
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                databaseUrlLength: process.env.DATABASE_URL?.length || 0,
                hasJwtSecret: !!process.env.JWT_SECRET
            }
        });
    }
});

// Error handling middleware (must be before 404 handler)
app.use((err, req, res, next) => {
    console.error("Express Error:", err);
    console.error("Error stack:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: err.name || "Error",
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler - catch all unhandled errors
app.use((err, req, res, next) => {
    // This should never be reached if error handling is correct, but just in case
    console.error("Global error handler caught:", err);
    if (!res.headersSent) {
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV !== 'production' ? err.message : undefined
        });
    }
});

// Export for Vercel serverless
// Vercel expects Express app to be exported directly
// The app will handle all routes and errors internally
module.exports = app;

