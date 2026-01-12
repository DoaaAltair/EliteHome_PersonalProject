# 🚀 Serverless API Routes

Deze API is gesplitst in individuele serverless functions voor betere performance op Vercel.

## 📁 Structuur

```
api/
├── _lib/                    # Shared utilities
│   ├── db.js               # Database connection
│   └── auth.js             # Authentication helpers
├── auth/                    # Authentication routes
│   ├── login.js           # POST /api/auth/login
│   ├── register.js         # POST /api/auth/register
│   └── check.js            # GET /api/auth/check
├── apartments/             # Apartment routes
│   ├── index.js           # GET/POST /api/apartments
│   └── [id].js            # GET/PUT/DELETE /api/apartments/:id
├── invoices/               # Invoice routes
│   ├── index.js           # GET/POST /api/invoices
│   └── [id].js            # GET/DELETE /api/invoices/:id
└── finances/               # Finance routes
    ├── index.js           # GET/POST /api/finances
    └── [id].js            # DELETE /api/finances/:id
```

## ✅ Voordelen

- **Snel**: Elke route is een aparte serverless function
- **Stabiel**: Geen grote Express app die kan crashen
- **Vercel-native**: Optimized voor Vercel's serverless platform
- **Schaalbaar**: Elke route schaalt onafhankelijk

## 🔧 Hoe het werkt

Elke file export een `handler` functie:

```javascript
module.exports = async function handler(req, res) {
    // req.method - HTTP method (GET, POST, etc.)
    // req.body - Request body
    // req.query - Query parameters (voor [id].js routes)
    // res.json() - Send JSON response
    // res.status() - Set status code
}
```

## 📝 Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/check` - Verify token

### Apartments
- `GET /api/apartments` - Get all apartments
- `POST /api/apartments` - Create apartment (auth required)
- `GET /api/apartments/:id` - Get single apartment
- `PUT /api/apartments/:id` - Update apartment (auth required)
- `DELETE /api/apartments/:id` - Delete apartment (auth required)

### Invoices
- `GET /api/invoices` - Get all invoices (auth required)
- `POST /api/invoices` - Create invoice with file upload (auth required)
- `GET /api/invoices/:id` - Get single invoice (auth required)
- `DELETE /api/invoices/:id` - Delete invoice (auth required)

### Finances
- `GET /api/finances` - Get all finances (auth required)
- `POST /api/finances` - Create finance record with file upload (auth required)
- `DELETE /api/finances/:id` - Delete finance record (auth required)

## 🔐 Authentication

Gebruik de helpers uit `_lib/auth.js`:

```javascript
const { requireAuth, requireRole } = require("../_lib/auth");

// Require authentication
const user = requireAuth(req, res);
if (!user) return; // Response already sent

// Require specific role
const user = requireRole(req, res, "admin");
if (!user) return;
```

## 🗄️ Database

Gebruik de shared database connection:

```javascript
const db = require("../_lib/db");

// MySQL-compatible syntax
const [rows] = await db.execute("SELECT * FROM table WHERE id = ?", [id]);
const [result] = await db.execute("INSERT INTO table (col) VALUES (?)", [value]);
```

## 📤 File Uploads

Voor routes met file uploads (invoices, finances):

```javascript
const multer = require("multer");
const { uploadToSupabase } = require("../../backend/utils/supabaseStorage");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// In handler:
await new Promise((resolve, reject) => {
    upload.single("proof")(req, res, (err) => {
        if (err) reject(err);
        else resolve();
    });
});

if (req.file) {
    const uploadResult = await uploadToSupabase(
        req.file.buffer,
        req.file.originalname,
        "invoices"
    );
    // Use uploadResult.url
}
```

## 🚀 Deployment

Vercel detecteert automatisch de serverless functions. Geen extra configuratie nodig!

De oude `api/index.js` wordt niet meer gebruikt en kan worden verwijderd.

