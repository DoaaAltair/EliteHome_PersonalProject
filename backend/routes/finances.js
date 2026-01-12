const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, safeName);
    },
});

const upload = multer({ storage });

router.post("/", upload.single("proof"), async (req, res) => {
    try {
        const {
            apartment_id,
            owner_name,
            tenant_name,
            check_in_date,
            check_out_date,
            amount_paid,
            agent_expenses,
            expenses_description,
            currency,
        } = req.body;

        const proof = req.file ? req.file.filename : null;

        if (!apartment_id || !amount_paid) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const checkin_date = check_in_date || null;
        const checkout_date = check_out_date || null;
        const paid_amount = amount_paid || 0;
        const expenses = agent_expenses || 0;
        const expense_description = expenses_description || null;

        const [result] = await db.execute(
            `INSERT INTO finances 
             (apartment_id, owner_name, tenant_name, checkin_date, checkout_date, paid_amount, expenses, expense_description, proof, currency)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                apartment_id,
                owner_name || null,
                tenant_name || null,
                checkin_date,
                checkout_date,
                paid_amount,
                expenses,
                expense_description,
                proof,
                currency || "₺",
            ]
        );

        res.status(201).json({
            message: "✅ Finance record added successfully",
            id: result.insertId,
        });
    } catch (err) {
        console.error("❌ Error creating finance:", err);
        res.status(500).json({
            message: "Server error while creating finance record",
            error: err.sqlMessage || err.message,
        });
    }
});

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                f.id,
                f.apartment_id,
                a.number AS apartment_number,
                f.owner_name,
                f.tenant_name,
                f.checkin_date AS check_in_date,
                f.checkout_date AS check_out_date,
                f.paid_amount AS amount_paid,
                f.expenses AS agent_expenses,
                f.expense_description AS expenses_description,
                (f.paid_amount - COALESCE(f.expenses, 0)) AS remaining_balance,
                f.proof,
                f.currency,
                f.created_at
            FROM finances f
            JOIN apartments a ON f.apartment_id = a.id
            ORDER BY f.created_at DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error("❌ Error fetching finances:", err);
        res.status(500).json({
            message: "Server error while fetching finance records",
            error: err.sqlMessage || err.message,
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing id" });

        const [result] = await db.execute("DELETE FROM finances WHERE id = ?", [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Finance record not found" });
        }

        res.json({ message: "🗑️ Finance record deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting finance:", err);
        res.status(500).json({
            message: "Server error while deleting finance record",
            error: err.sqlMessage || err.message,
        });
    }
});

module.exports = router;
