# 🏠 Elite Home - Property Management System

Een modern vastgoedbeheersysteem gebouwd met React frontend en Node.js/Express backend met Supabase (PostgreSQL) database. Perfect voor het beheren van appartementen, financiën, facturen en gebruikers.

## ✨ Features

### 🔐 Authenticatie & Autorisatie
- JWT-gebaseerde authenticatie met secure token storage
- Role-based access control (Admin, Owner, Staff, Tenant)
- Veilige password hashing met bcrypt (10 salt rounds)
- Gebruiker blokkeren/deblokkeren functionaliteit
- Automatische sessie validatie en token refresh
- Protected routes met role-based redirects

### 👨‍💼 Admin Dashboard
- **Gebruikersbeheer**: 
  - Bekijk alle gebruikers met filters
  - Blokkeer/deblokkeer accounts
  - Gebruikersstatistieken (totaal, per rol, geblokkeerd)
- **Notificaties**: 
  - Verstuur systeembrede notificaties
  - Appartement-specifieke notificaties met tags
  - Notificatie beheer (verwijderen)
- **Eigenaar Beheer**: 
  - Wijs eigenaren toe aan appartementen
  - Bekijk alle eigenaren en hun toewijzingen
  - Eigenaar statistieken en overzichten
- **Financieel Overzicht**: 
  - Bekijk alle facturen en financiële records
  - Inkomsten statistieken en rapporten
  - Financiële overzichten per eigenaar
- **Dashboard Statistieken**: 
  - Real-time systeem metrics
  - Gebruikersstatistieken
  - Appartementenstatistieken
  - Factuur statistieken
- **Appartementen Beheer**: 
  - Volledige CRUD operaties voor appartementen
  - Appartement status management

### 🏠 Appartementen Beheer
- **Appartementenlijst** met foto's en filters
- **Status tracking** (Available/Rented, Empty/Rented)
- **Eigenaar toewijzingen** met naam en ID linking
- **Appartement details**: 
  - Type (rent/sale)
  - Beschrijving en specificaties
  - Prijs informatie
  - Employee assignment
- **Household management** met status tracking (✅ done indicator)
- **Foto upload functionaliteit** met Multer
- **Appartement zoeken en filteren**

### 📊 Financieel Systeem
- **Facturen Beheer**: 
  - Maak facturen aan voor appartementen
  - Upload bewijs documenten (PDF, images)
  - Multi-currency support (₺, €, $)
  - Factuur overzicht per appartement
  - Factuur details met beschrijving
  - Factuur verwijderen
- **Financiële Records**:
  - Check-in/check-out datums registratie
  - Betaalde bedragen tracking
  - Uitgaven registratie met beschrijving
  - Netto balans berekening (inkomsten - uitgaven)
  - Bewijs documenten upload
  - Multi-currency support
  - Periode berekening (dagen tussen check-in/out)

### 👤 Eigenaar Dashboard
- **Eigen Appartementen**: Bekijk alleen eigen toegewezen appartementen
- **Financieel Overzicht**: 
  - Per appartement financiële details
  - Check-in/check-out informatie
  - Tenant informatie
- **Jaarlijkse Inkomsten**: Automatische berekening (prijs × 12 maanden)
- **Recente Facturen**: Overzicht van laatste 10 facturen
- **Appartement Statistieken**: 
  - Totaal aantal appartementen
  - Gehuurd vs beschikbaar telling
  - Jaarlijkse inkomsten projectie

### 🔔 Notificatie Systeem
- Admin kan notificaties versturen naar alle gebruikers
- Appartement-specifieke notificaties met tags
- Real-time notificatie weergave op alle pagina's
- Notificatie beheer (verwijderen door admin)
- Notificatie geschiedenis met timestamps

### 📱 Responsive Design & UX
- **Mobile-first approach** - Werkt perfect op alle schermen
- **Modern, minimalistisch design** met glassmorphism effecten
- **Responsive layout** - Mobiel, tablet en desktop
- **Toegankelijke UI** met duidelijke feedback (✅/❌)
- **Intuïtieve navigatie** met role-based menu items
- **Loading states** en error handling
- **Form validatie** met directe feedback

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js (^4.21.2)
- **Database**: Supabase (PostgreSQL via pg ^8.11.3)
- **Authenticatie**: JWT (jsonwebtoken ^9.0.2)
- **Security**: bcrypt (^6.0.0) voor password hashing
- **File Upload**: Multer (^2.0.2)
- **CORS**: cors (^2.8.5)
- **Environment**: dotenv (^16.6.1)
- **Development**: nodemon (^3.1.4) voor auto-reload

### Frontend
- **Framework**: React (^18.3.1) met functional components
- **Routing**: React Router DOM (^6.30.1)
- **HTTP Client**: Axios (^1.12.2)
- **Build Tool**: React Scripts (5.0.1)
- **Styling**: CSS3 met custom properties en glassmorphism
- **State Management**: React Hooks (useState, useEffect)
- **Performance**: Web Vitals (^2.1.4)

### Database (Supabase/PostgreSQL)
- **Database**: PostgreSQL
- **Hosting**: Supabase Cloud
- **Features**: 
  - SSL verbindingen
  - Automatic backups
  - Real-time subscriptions (mogelijk voor toekomstige features)
  - Row Level Security (RLS) ready

## 📦 Installatie & Setup

### Vereisten
- Node.js (v14 of hoger) - [Download](https://nodejs.org/)
- npm of yarn package manager
- Supabase account (gratis tier beschikbaar) - [Aanmelden](https://supabase.com)

### Backend Setup

1. **Navigeer naar backend directory**
   ```bash
   cd backend
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Supabase Database Setup**
   - Maak een nieuw project aan op [supabase.com](https://supabase.com)
   - Ga naar **SQL Editor** in je Supabase dashboard
   - Kopieer en voer het PostgreSQL schema uit uit `database/schema.sql`
   - Of gebruik het schema uit `backend/SUPABASE_MIGRATION.md`

4. **Environment Configuratie**
   ```bash
   cp env.example .env
   ```
   
   Vul je `.env` bestand in met je Supabase credentials:
   ```env
   # Supabase Database Configuration
   DB_HOST=db.xxxxx.supabase.co
   DB_USER=postgres
   DB_PASSWORD=your_supabase_password
   DB_NAME=postgres
   DB_PORT=5432
   DB_SSL=true
   
   # JWT Secret (gebruik een sterke, willekeurige string)
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   
   # Server Configuration
   PORT=5000
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```
   
   **Tip**: Je Supabase credentials vind je in: **Project Settings → Database → Connection string**

5. **Maak standaard gebruikers aan**
   ```bash
   node seed_users.js
   ```
   
   Dit maakt de volgende gebruikers aan:
   - `admin` / `admin123` (role: admin)
   - `test` / `test123` (role: staff)
   - `owner` / `owner123` (role: owner)

6. **Test database connectie** (optioneel maar aanbevolen)
   ```bash
   node test_supabase_connection.js
   ```
   
   Je zou moeten zien:
   ```
   ✅ Connection successful!
   ✅ Found 5 tables
   ✅ All required tables exist!
   ```

7. **Start de backend server**
   ```bash
   npm start
   # of voor development met auto-reload
   npm run dev
   ```
   
   Server draait op: http://localhost:5000

### Frontend Setup

1. **Navigeer naar frontend directory**
   ```bash
   cd frontend
   ```

2. **Installeer dependencies**
   ```bash
   npm install
   ```

3. **Start de React development server**
   ```bash
   npm start
   ```
   
   Frontend opent automatisch op: http://localhost:3000

4. **Build voor productie** (optioneel)
   ```bash
   npm run build
   ```

## 🔑 Standaard Login Accounts

Na het uitvoeren van `seed_users.js` kun je inloggen met:

| Username | Password | Role | Toegang |
|----------|----------|------|---------|
| `admin` | `admin123` | Admin | Volledige toegang tot alle functies |
| `test` | `test123` | Staff | Appartementen, facturen en financiën beheer |
| `owner` | `owner123` | Owner | Eigen appartementen en financiën bekijken |

**⚠️ Belangrijk**: Wijzig deze wachtwoorden in productie!

## 📡 API Endpoints

### Authenticatie
- `POST /api/auth/login` - Gebruiker inloggen
- `POST /api/auth/register` - Nieuwe gebruiker registreren
- `GET /api/auth/check` - Token validatie

### Admin (Beveiligd - Admin rol vereist)
- `GET /api/admin/users` - Bekijk alle gebruikers
- `PATCH /api/admin/users/:id/block` - Blokkeer gebruiker
- `PATCH /api/admin/users/:id/unblock` - Deblokkeer gebruiker
- `GET /api/admin/stats` - Dashboard statistieken
- `POST /api/admin/notifications` - Verstuur notificatie
- `GET /api/admin/notifications` - Bekijk alle notificaties
- `DELETE /api/admin/notifications/:id` - Verwijder notificatie
- `POST /api/admin/assign-owner` - Wijs eigenaar toe aan appartement
- `GET /api/admin/owners` - Bekijk alle eigenaren
- `GET /api/admin/owners/:owner_name/apartments` - Appartementen per eigenaar
- `GET /api/admin/owners/assignments` - Eigenaar toewijzingen statistieken
- `GET /api/admin/invoices` - Bekijk alle facturen
- `GET /api/admin/finances` - Bekijk alle financiële records

### Eigenaar (Beveiligd - Owner rol vereist)
- `GET /api/owner/apartments` - Bekijk eigen appartementen
- `GET /api/owner/dashboard` - Eigenaar dashboard statistieken
- `GET /api/owner/financials` - Financieel overzicht
- `GET /api/owner/invoices` - Eigen facturen

### Publiek
- `GET /api/apartments` - Bekijk alle appartementen
- `GET /api/apartments/:id` - Bekijk specifiek appartement
- `GET /api/notifications` - Bekijk alle notificaties
- `GET /api/notifications/apartment/:tag` - Notificaties per appartement tag

### Beveiligd (Authenticatie vereist)
- `POST /api/apartments` - Maak nieuw appartement aan
- `PUT /api/apartments/:id` - Update appartement
- `DELETE /api/apartments/:id` - Verwijder appartement
- `PATCH /api/apartments/:id/household-done` - Toggle household status
- `GET /api/invoices` - Bekijk facturen
- `POST /api/invoices` - Maak factuur aan (met file upload)
- `GET /api/invoices/:id` - Bekijk specifieke factuur
- `DELETE /api/invoices/:id` - Verwijder factuur
- `GET /api/finances` - Bekijk financiële records
- `POST /api/finances` - Maak financiële record aan (met file upload)
- `DELETE /api/finances/:id` - Verwijder financiële record

## 📁 Project Structuur

```
elite-home/
├── backend/
│   ├── middleware/              # Authenticatie middleware
│   │   ├── authMiddleware.js   # Role-based access control
│   │   └── verifyToken.js       # JWT token verificatie
│   ├── routes/                  # API route handlers
│   │   ├── adminRoutes.js      # Admin-specifieke routes
│   │   ├── auth.js             # Authenticatie routes
│   │   ├── finances.js         # Financiële records routes
│   │   ├── invoices.js         # Facturen routes
│   │   ├── notifications.js    # Notificaties routes
│   │   └── ownerRoutes.js      # Eigenaar routes
│   ├── uploads/                 # Geüploade bestanden
│   ├── db.js                    # Database connectie (Supabase/PostgreSQL)
│   ├── server.js                # Main server file
│   ├── seed_users.js            # Script om standaard gebruikers aan te maken
│   ├── test_supabase_connection.js  # Database connectie test
│   ├── fix_env.js               # .env file correctie script
│   ├── env.example              # Environment variabelen voorbeeld
│   ├── SUPABASE_MIGRATION.md    # Supabase migratie documentatie
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── Elite_Home_logo*.png # Logo bestanden
│   ├── src/
│   │   ├── components/          # Herbruikbare componenten
│   │   │   ├── Header.jsx       # Navigatie header
│   │   │   └── ProtectedRoute.jsx # Route protection
│   │   ├── pages/               # Page componenten
│   │   │   ├── AdminDashboard.jsx  # Admin dashboard
│   │   │   ├── Apartments.jsx      # Appartementen beheer
│   │   │   ├── Home.jsx           # Home pagina
│   │   │   ├── Login.jsx          # Login pagina
│   │   │   └── OwnerDashboard.jsx # Eigenaar dashboard
│   │   ├── utils/               # Utility functies
│   │   │   └── api.js           # API helper functies
│   │   ├── assets/              # Afbeeldingen en assets
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css              # Global styling
│   │   └── index.js             # Entry point
│   └── package.json
├── database/
│   └── schema.sql               # PostgreSQL database schema
└── README.md
```

## 🔒 Security Features

- **JWT Authenticatie**: Veilige token-gebaseerde authenticatie met expiration
- **Password Hashing**: bcrypt met 10 salt rounds voor alle wachtwoorden
- **Role-based Access Control**: Verschillende permissies per gebruikerstype
- **Input Validatie**: Server-side validatie voor alle inputs
- **CORS Protection**: Geconfigureerd voor specifieke origins
- **SQL Injection Protection**: Parameterized queries via PostgreSQL
- **SSL Verbinding**: Verplichte SSL verbinding met Supabase
- **File Upload Validatie**: Beveiligde file uploads met Multer
- **Protected Routes**: Frontend route protection met role checks
- **Token Storage**: Secure localStorage voor JWT tokens

## 🚀 Development

### Backend Development
```bash
cd backend
npm run dev  # Gebruikt nodemon voor auto-restart bij wijzigingen
```

### Frontend Development
```bash
cd frontend
npm start    # React development server met hot reload
```

### Database Testen
```bash
cd backend
node test_supabase_connection.js
```

### Handige Scripts

- `node seed_users.js` - Maak standaard gebruikers aan
- `node test_supabase_connection.js` - Test database connectie
- `node fix_env.js` - Corrigeer .env configuratie automatisch

## 📦 Production Deployment

### Vercel Deployment (Frontend)

1. **Push code naar GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Verbind repository met Vercel**
   - Ga naar [vercel.com](https://vercel.com)
   - Import je GitHub repository
   - Configureer build settings:
     - **Framework Preset**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

3. **Environment Variables** (indien nodig)
   - Voeg environment variabelen toe in Vercel dashboard

4. **Deploy**
   - Vercel deployt automatisch bij elke push naar main branch

### Backend Deployment

1. **Environment Variables**: 
   - Stel productie environment variabelen in
   - Gebruik productie Supabase database credentials
   - Gebruik een sterke, willekeurige JWT secret

2. **Database**: 
   - Gebruik productie Supabase project
   - Zorg dat alle tabellen zijn aangemaakt
   - Run `seed_users.js` voor productie gebruikers

3. **CORS**: 
   - Configureer CORS voor je productie domain
   - Update `CORS_ORIGIN` in `.env`

4. **File Uploads**: 
   - Zorg dat `uploads/` directory juiste permissies heeft
   - Overweeg cloud storage (Supabase Storage) voor productie

5. **SSL**: 
   - Supabase gebruikt automatisch SSL verbindingen
   - Zorg dat `DB_SSL=true` is ingesteld

### Supabase Setup voor Productie

- Gebruik een apart Supabase project voor productie
- Configureer Row Level Security (RLS) policies indien nodig
- Zet up database backups
- Monitor database performance via Supabase dashboard
- Overweeg connection pooling voor betere performance

## 🐛 Troubleshooting

### Database Connectie Problemen

**Error: "Connection refused" of "ENOTFOUND"**
- Check of `DB_HOST` correct is (moet `db.xxxxx.supabase.co` zijn, **zonder** `https://`)
- Check of `DB_NAME` op `postgres` staat (niet `EliteHome` of andere naam)
- Check of `DB_SSL=true` is ingesteld
- Run `node fix_env.js` om automatisch te corrigeren

**Error: "Password authentication failed"**
- Reset database password in Supabase Dashboard (Settings → Database → Reset database password)
- Update `DB_PASSWORD` in `.env` bestand
- Kopieer het nieuwe wachtwoord direct (je ziet het maar één keer!)

**Error: "Database does not exist"**
- Check `DB_NAME` - moet zijn `postgres` voor Supabase
- Check of je Supabase project actief is

### Login Problemen

**Error: "Invalid credentials"**
- Run `node seed_users.js` om standaard gebruikers aan te maken
- Check of gebruikers bestaan in Supabase database (SQL Editor → `SELECT * FROM users;`)
- Check JWT_SECRET in `.env` bestand

**Error: "User not found"**
- Zorg dat `seed_users.js` is uitgevoerd
- Check database connectie met `test_supabase_connection.js`

### File Upload Problemen

**Error: "Cannot upload file"**
- Check of `uploads/` directory bestaat in `backend/` folder
- Check of directory schrijfrechten heeft
- Check Multer configuratie in route bestanden

### Frontend Problemen

**Error: "Cannot connect to API"**
- Check of backend server draait op poort 5000
- Check CORS configuratie in `backend/server.js`
- Check `CORS_ORIGIN` in `.env` bestand

**Error: "Token expired"**
- Log opnieuw in
- Check JWT expiration tijd in `backend/routes/auth.js`

## 📝 Handige Commands

```bash
# Backend
cd backend
npm install          # Installeer dependencies
npm start            # Start server
npm run dev          # Start met auto-reload
node seed_users.js   # Maak gebruikers aan
node test_supabase_connection.js  # Test database

# Frontend
cd frontend
npm install          # Installeer dependencies
npm start            # Start development server
npm run build        # Build voor productie
npm test             # Run tests

# Database
# Run schema in Supabase SQL Editor
```

## 🤝 Contributing

1. Fork de repository
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 License

Dit project is gelicenseerd onder de MIT License.

## 👥 Support & Documentatie

Voor vragen of problemen:
- Check `backend/SUPABASE_MIGRATION.md` voor database setup details
- Check `DATABASE_SETUP.md` voor database troubleshooting
- Open een issue op GitHub
- Check Supabase documentatie: [supabase.com/docs](https://supabase.com/docs)

