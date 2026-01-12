const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/apartments", async (req, res) => {
    try {
        if (!req.user || !req.user.username) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const owner_name = req.user.username;

        const [rows] = await db.execute(`
            SELECT id, number, type, description, status, price, owner_name 
            FROM apartments 
            WHERE owner_name = ? 
            ORDER BY number ASC
        `, [owner_name]);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching owner apartments:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/dashboard", async (req, res) => {
    try {
        if (!req.user || !req.user.username) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const owner_name = req.user.username;

        const [apartmentStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_apartments,
                SUM(CASE WHEN LOWER(status) = 'rented' THEN 1 ELSE 0 END) as rented_count,
                SUM(CASE WHEN LOWER(status) = 'empty' OR LOWER(status) = 'available' THEN 1 ELSE 0 END) as available_count,
                SUM(price * 12) as yearly_income
            FROM apartments 
            WHERE owner_name = ?
        `, [owner_name]);

        const [invoiceStats] = await db.execute(`
            SELECT 
                COUNT(*) as total_invoices,
                SUM(i.total) as total_invoice_amount
            FROM invoices i
            JOIN apartments a ON i.apartment_id = a.id
            WHERE a.owner_name = ?
        `, [owner_name]);

        const [recentInvoices] = await db.execute(`
            SELECT 
                i.id,
                i.item,
                i.total,
                i.created_at,
                a.number as apartment_number
            FROM invoices i
            JOIN apartments a ON i.apartment_id = a.id
            WHERE a.owner_name = ?
            ORDER BY i.created_at DESC
            LIMIT 10
        `, [owner_name]);

        res.json({
            apartments: apartmentStats[0],
            invoices: invoiceStats[0],
            recent_invoices: recentInvoices
        });
    } catch (err) {
        console.error("Error fetching owner dashboard:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/financials", async (req, res) => {
    try {
        if (!req.user || !req.user.username) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const owner_name = req.user.username;

        const [rows] = await db.execute(`
            SELECT 
                a.id AS apartment_id,
                a.number AS apartment_number,
                a.price,
                f.paid_amount AS total_income,
                f.checkin_date,
                f.checkout_date,
                f.tenant_name,
                f.currency,
                f.created_at,
                (COALESCE(f.checkout_date, CURRENT_DATE) - f.checkin_date) AS period_days
            FROM finances f
            JOIN apartments a ON f.apartment_id = a.id
            WHERE a.owner_name = ?
            ORDER BY f.created_at DESC
        `, [owner_name]);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching financials:", err);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/invoices", async (req, res) => {
    try {
        if (!req.user || !req.user.username) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const owner_name = req.user.username;

        const [rows] = await db.execute(`
            SELECT 
                i.id,
                i.item,
                i.total,
                i.created_at,
                a.number as apartment_number
            FROM invoices i
            JOIN apartments a ON i.apartment_id = a.id
            WHERE a.owner_name = ?
            ORDER BY i.created_at DESC
        `, [owner_name]);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching owner invoices:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
