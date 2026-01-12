const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

router.post("/", upload.single("proof"), async (req, res) => {
    try {
        console.log("Incoming invoice data:", req.body);

        const { apartment_id, employee_name, item, total, description, currency } = req.body;
        const proof = req.file ? req.file.filename : null;

        if (!apartment_id || !employee_name || !item || !total) {
            return res.status(400).json({ message: "Please fill in all required fields." });
        }

        const [result] = await db.execute(
            "INSERT INTO invoices (apartment_id, employee_name, item, total, description, proof, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
            [apartment_id, employee_name, item, total, description, proof, currency || "₺"]
        );

        res.status(201).json({
            id: result.insertId,
            apartment_id,
            employee_name,
            item,
            total,
            description,
            proof,
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
