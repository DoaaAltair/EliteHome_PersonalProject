// DELETE /api/finances/:id
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

        // DELETE - Delete finance record
        if (req.method === "DELETE") {
            // Get finance record to delete proof file from Supabase Storage
            const [financeRows] = await db.execute("SELECT proof FROM finances WHERE id = ?", [id]);
            if (financeRows.length === 0) {
                return res.status(404).json({ message: "Finance record not found" });
            }

            // Delete proof file from Supabase Storage if it exists
            const proofUrl = financeRows[0].proof;
            if (proofUrl) {
                try {
                    await deleteFromSupabase(proofUrl, "invoices");
                } catch (deleteError) {
                    console.warn("⚠️ Could not delete file from Supabase Storage:", deleteError);
                    // Continue with finance deletion even if file deletion fails
                }
            }

            const [result] = await db.execute("DELETE FROM finances WHERE id = ?", [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Finance record not found" });
            }

            return res.json({ message: "🗑️ Finance record deleted successfully" });
        }

        // Method not allowed
        return res.status(405).json({ message: "Method not allowed" });
    } catch (err) {
        console.error("❌ Error deleting finance:", err);
        res.status(500).json({
            message: "Server error while deleting finance record",
            error: err.sqlMessage || err.message,
        });
    }
};

