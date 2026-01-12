// GET /api/invoices (all) or POST /api/invoices
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

        // GET - Fetch all invoices
        if (req.method === "GET") {
            const [rows] = await db.execute(
                `SELECT invoices.*, 
                       apartments.number AS apartment_number
                 FROM invoices 
                 JOIN apartments ON invoices.apartment_id = apartments.id 
                 ORDER BY invoices.created_at DESC`
            );
            return res.json(rows);
        }

        // POST - Create new invoice (with file upload)
        if (req.method === "POST") {
            // Handle file upload
            await multerMiddleware(req, res);

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

            return res.status(201).json({
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
        }

        // Method not allowed
        return res.status(405).json({ message: "Method not allowed" });
    } catch (err) {
        console.error("Error in invoices:", err);
        res.status(500).json({ message: "Server error" });
    }
};

