// GET /api/apartments/:id, PUT /api/apartments/:id, DELETE /api/apartments/:id
const db = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");

module.exports = async function handler(req, res) {
    try {
        const { id } = req.query; // Vercel uses req.query for dynamic routes

        if (!id) {
            return res.status(400).json({ message: "Missing id" });
        }

        // GET - Fetch single apartment
        if (req.method === "GET") {
            const [rows] = await db.execute("SELECT * FROM apartments WHERE id = ?", [id]);

            if (rows.length === 0) {
                return res.status(404).json({ message: "Apartment not found" });
            }

            return res.json(rows[0]);
        }

        // PUT - Update apartment (requires auth)
        if (req.method === "PUT") {
            const user = requireAuth(req, res);
            if (!user) return;

            const allowed = ["type", "employee", "number", "description", "status", "household", "photo"];
            const payload = req.body || {};

            const fields = Object.keys(payload).filter(
                (k) => allowed.includes(k) && payload[k] !== undefined
            );
            if (fields.length === 0) {
                return res.status(400).json({ message: "No valid fields to update" });
            }

            const sets = fields.map((k) => `${k} = ?`).join(", ");
            const values = fields.map((k) => payload[k]);
            values.push(id);

            await db.execute(`UPDATE apartments SET ${sets} WHERE id = ?`, values);

            const [rows] = await db.execute("SELECT * FROM apartments WHERE id = ?", [id]);
            if (!rows.length) {
                return res.status(404).json({ message: "Apartment not found" });
            }
            return res.json(rows[0]);
        }

        // DELETE - Delete apartment (requires auth)
        if (req.method === "DELETE") {
            const user = requireAuth(req, res);
            if (!user) return;

            const [result] = await db.execute("DELETE FROM apartments WHERE id = ?", [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Apartment not found" });
            }
            return res.json({ message: "Apartment deleted" });
        }

        // Method not allowed
        return res.status(405).json({ message: "Method not allowed" });
    } catch (err) {
        console.error("Error in apartment [id]:", err);
        res.status(500).json({ message: "Server error" });
    }
};

