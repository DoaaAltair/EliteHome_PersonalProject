const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const { uploadToSupabase, deleteFromSupabase } = require("../utils/supabaseStorage");

// Use memory storage for Vercel (serverless) - files will be uploaded to Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("proof"), async (req, res) => {
    try {
        console.log("Incoming invoice data:", req.body);

        const { apartment_id, employee_name, item, total, description, currency } = req.body;
        let proofUrl = null;

        // Upload file to Supabase Storage if provided
        if (req.file) {
            try {
                const uploadResult = await uploadToSupabase(
                    req.file.buffer,
                    req.file.originalname,
                    "invoices"
                );
                proofUrl = uploadResult.url;
                console.log("✅ File uploaded to Supabase Storage:", proofUrl);
            } catch (uploadError) {
                console.error("❌ Error uploading file to Supabase:", uploadError);
                return res.status(500).json({
                    message: "Failed to upload proof file",
                    error: uploadError.message
                });
            }
        }

        if (!apartment_id || !employee_name || !item || !total) {
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        const [result] = await db.execute(
            "INSERT INTO invoices (apartment_id, employee_name, item, total, description, proof, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
            [apartment_id, employee_name, item, total, description, proofUrl, currency || "₺"]
        );

        res.status(201).json({
            id: result.insertId,
            apartment_id,
            employee_name,
            item,
            total,
            description,
            proof: proofUrl,
            currency: currency || "₺",
            created_at: new Date(),
        });
    } catch (err) {
        console.error("Error creating invoice:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT invoices.*, 
                   apartments.number AS apartment_number
             FROM invoices 
             JOIN apartments ON invoices.apartment_id = apartments.id 
             ORDER BY invoices.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching invoices:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM invoices WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Invoice not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error("Error fetching invoice:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing id" });

        // Get invoice to delete proof file from Supabase Storage
        const [invoiceRows] = await db.execute("SELECT proof FROM invoices WHERE id = ?", [id]);
        if (invoiceRows.length === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Delete proof file from Supabase Storage if it exists
        const proofUrl = invoiceRows[0].proof;
        if (proofUrl) {
            try {
                await deleteFromSupabase(proofUrl, "invoices");
            } catch (deleteError) {
                console.warn("⚠️ Could not delete file from Supabase Storage:", deleteError);
                // Continue with invoice deletion even if file deletion fails
            }
        }

        const [result] = await db.execute("DELETE FROM invoices WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.json({ message: "Invoice deleted" });
    } catch (err) {
        console.error("Error deleting invoice:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
