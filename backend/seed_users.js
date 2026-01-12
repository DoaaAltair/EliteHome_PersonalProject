require("dotenv").config();
const db = require("./db");
const bcrypt = require("bcrypt");

async function seedUsers() {
    console.log("🌱 Seeding default users...\n");

    const defaultUsers = [
        {
            username: "admin",
            password: "admin123",
            role: "admin"
        },
        {
            username: "test",
            password: "test123",
            role: "staff"
        },
        {
            username: "owner",
            password: "owner123",
            role: "owner"
        }
    ];

    try {
        for (const user of defaultUsers) {
            const [existing] = await db.execute(
                "SELECT id FROM users WHERE username = ?",
                [user.username]
            );

            if (existing.length > 0) {
                console.log(`⚠️  User '${user.username}' already exists, skipping...`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);

            const [result] = await db.execute(
                "INSERT INTO users (username, password, role, is_blocked) VALUES (?, ?, ?, ?)",
                [user.username, hashedPassword, user.role, false]
            );

            console.log(`✅ Created user: ${user.username} (role: ${user.role}, id: ${result.insertId})`);
        }

        console.log("\n✅ All users seeded successfully!");
        console.log("\n📋 Default login credentials:");
        console.log("   Admin:  username='admin'  password='admin123'");
        console.log("   Test:   username='test'    password='test123'");
        console.log("   Owner:  username='owner'   password='owner123'");
        console.log("\n💡 You can now login with these credentials!");

    } catch (err) {
        console.error("❌ Error seeding users:", err);
        process.exit(1);
    } finally {
        await db.end();
    }
}

seedUsers();

