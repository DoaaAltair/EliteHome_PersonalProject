// GET /api/invoices/:id or DELETE /api/invoices/:id
const db = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");
const { deleteFromSupabase } = require("../../backend/utils/supabaseStorage");

module.exports = async function handler(req, res) {
    try {
        const user = requireAuth(req, res);
        if (!user) return;

        const { id } = req.query; // Vercel uses req.query for dynamic routes

        if (!id) {
            return res.status(400).json({ message: "Missing id" });
        }

        // GET - Fetch single invoice
        if (req.method === "GET") {
            const [rows] = await db.execute("SELECT * FROM invoices WHERE id = ?", [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: "Invoice not found" });
            }
            return res.json(rows[0]);
        }

        // DELETE - Delete invoice
        if (req.method === "DELETE") {
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
            return res.json({ message: "Invoice deleted" });
        }

        // Method not allowed
        return res.status(405).json({ message: "Method not allowed" });
    } catch (err) {
        console.error("Error in invoice [id]:", err);
        res.status(500).json({ message: "Server error" });
    }
};

