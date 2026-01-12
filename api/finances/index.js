// GET /api/finances (all) or POST /api/finances
const db = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");
const multer = require("multer");
const { uploadToSupabase, deleteFromSupabase } = require("../../backend/utils/supabaseStorage");

// Use memory storage for Vercel (serverless)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Multer middleware wrapper for serverless
const multerMiddleware = (req, res) => {
    return new Promise((resolve, reject) => {
        upload.single("proof")(req, res, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

module.exports = async function handler(req, res) {
    try {
        const user = requireAuth(req, res);
        if (!user) return;

        // GET - Fetch all finances
        if (req.method === "GET") {
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

            return res.json(rows);
        }

        // POST - Create new finance record (with file upload)
        if (req.method === "POST") {
            // Handle file upload
            await multerMiddleware(req, res);

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

            let proofUrl = null;

            // Upload file to Supabase Storage if provided
            if (req.file) {
                try {
                    const uploadResult = await uploadToSupabase(
                        req.file.buffer,
                        req.file.originalname,
                        "invoices" // Using same bucket for finances proof files
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
                    proofUrl,
                    currency || "₺",
                ]
            );

            return res.status(201).json({
                message: "✅ Finance record added successfully",
                id: result.insertId,
            });
        }

        // Method not allowed
        return res.status(405).json({ message: "Method not allowed" });
    } catch (err) {
        console.error("❌ Error in finances:", err);
        res.status(500).json({
            message: "Server error while processing finance record",
            error: err.sqlMessage || err.message,
        });
    }
};

