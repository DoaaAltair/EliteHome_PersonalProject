// GET /api/apartments (all) or POST /api/apartments
const db = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");

module.exports = async function handler(req, res) {
    try {
        // GET - Fetch all apartments
        if (req.method === "GET") {
            const [rows] = await db.execute(
                "SELECT * FROM apartments ORDER BY id DESC"
            );
            return res.json(rows);
        }

        // POST - Create new apartment (requires auth)
        if (req.method === "POST") {
            const user = requireAuth(req, res);
            if (!user) return; // Response already sent

            const { type, employee, owner_name, number, description, status, household } = req.body;

            if (!type || !employee || !number) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const [result] = await db.execute(
                `INSERT INTO apartments (type, employee, owner_name, number, description, status, household)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [type, employee, owner_name || null, number, description, status, household]
            );

            return res.status(201).json({ message: "Apartment added", id: result.insertId });
        }

        // Method not allowed
        return res.status(405).json({ message: "Method not allowed" });
    } catch (err) {
        console.error("Error in apartments:", err);
        res.status(500).json({ message: "Server error" });
    }
};

