# 🚀 Supabase Migratie - Stap 4, 5 en 6

## ✅ Wat is aangepast

### Stap 4: Environment variabelen
- ✅ `env.example` is aangepast met Supabase configuratie
- ✅ Maak een `.env` bestand aan met je Supabase credentials

### Stap 5: Alle queries aangepast
- ✅ `db.js` - PostgreSQL Pool met MySQL-compatibele wrapper
- ✅ `auth.js` - Alle queries werken nu met PostgreSQL
- ✅ `adminRoutes.js` - Alle queries geconverteerd
- ✅ `ownerRoutes.js` - MySQL functies vervangen (DATEDIFF → date subtraction, etc.)
- ✅ `finances.js` - IFNULL → COALESCE
- ✅ `invoices.js` - NOW() → CURRENT_TIMESTAMP
- ✅ `notifications.js` - Alle queries geconverteerd
- ✅ `server.js` - Database connectie test aangepast

### Stap 6: Dependencies en testen
- ✅ `package.json` - `pg` package toegevoegd, `mysql2` verwijderd
- ✅ Dependencies geïnstalleerd
- ✅ Test script gemaakt: `test_supabase_connection.js`

## 📋 Wat je nu moet doen

### 1. Maak een `.env` bestand aan

Kopieer `env.example` naar `.env` en vul je Supabase credentials in:

```env
# Supabase Database Configuration
DB_HOST=db.xxxxx.supabase.co
DB_USER=postgres
DB_PASSWORD=je_supabase_wachtwoord
DB_NAME=postgres
DB_PORT=5432
DB_SSL=true

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=5000

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Waar vind je je Supabase credentials?**
1. Ga naar [supabase.com](https://supabase.com) en log in
2. Selecteer je project
3. Ga naar **Settings** → **Database**
4. Scroll naar **Connection string** of **Connection pooling**
5. Kopieer de credentials:
   - **Host**: `db.xxxxx.supabase.co` (uit de connection string)
   - **User**: `postgres`
   - **Password**: Reset deze als je hem niet weet (Settings → Database → Reset database password)
   - **Database**: `postgres`
   - **Port**: `5432`

### 2. Maak de database tabellen aan in Supabase

1. Ga naar je Supabase project dashboard
2. Klik op **SQL Editor** in de sidebar
3. Kopieer en plak het PostgreSQL schema uit `database/schema.sql` (of gebruik het schema dat ik eerder heb gegeven)
4. Klik op **Run** om de tabellen aan te maken

### 3. Test de database connectie

Run het test script:

```bash
cd backend
node test_supabase_connection.js
```

Dit script test:
- ✅ Database connectie
- ✅ Tabel verificatie
- ✅ MySQL-compatibele wrapper
- ✅ INSERT queries met RETURNING

### 4. Start de server

```bash
cd backend
npm start
```

Je zou moeten zien:
```
✅ Connected to PostgreSQL database
✅ Database connected successfully
🚀 Server running on port 5000
```

## 🔧 Technische details

### MySQL → PostgreSQL conversies

De code gebruikt nu een wrapper functie die automatisch:
- `?` placeholders converteert naar `$1, $2, $3...`
- INSERT queries automatisch `RETURNING id` toevoegt
- Resultaten retourneert in MySQL-compatibele format

### Functie conversies

- `IFNULL()` → `COALESCE()`
- `DATEDIFF()` → date subtraction (`date1 - date2`)
- `CURDATE()` → `CURRENT_DATE`
- `NOW()` → `CURRENT_TIMESTAMP`

### Query resultaten

- **SELECT queries**: `[rows, fields]` - rows is een array
- **INSERT/UPDATE/DELETE**: `[result, fields]` - result heeft `insertId` en `affectedRows`

## ⚠️ Belangrijke opmerkingen

1. **SSL verbinding**: Supabase vereist SSL, dus `DB_SSL=true` is verplicht
2. **Database naam**: Gebruik altijd `postgres` als database naam voor Supabase
3. **Wachtwoord**: Als je het wachtwoord reset, kopieer het direct - je ziet het daarna niet meer!
4. **Schema**: Zorg dat je het PostgreSQL schema hebt uitgevoerd voordat je de server start

## 🐛 Troubleshooting

### Error: "Connection refused"
- Check je `DB_HOST` - moet zijn `db.xxxxx.supabase.co`
- Check je `DB_PORT` - moet zijn `5432`
- Check of `DB_SSL=true` is ingesteld

### Error: "Password authentication failed"
- Reset je database wachtwoord in Supabase Dashboard
- Update `DB_PASSWORD` in je `.env` bestand

### Error: "Database does not exist"
- Check `DB_NAME` - moet zijn `postgres`

### Error: "Table does not exist"
- Run het PostgreSQL schema in Supabase SQL Editor
- Check of alle tabellen zijn aangemaakt

## ✅ Volgende stappen

Na een succesvolle test:
1. ✅ Database connectie werkt
2. ✅ Alle tabellen zijn aangemaakt
3. ✅ Server start zonder errors
4. ✅ Je kunt nu je applicatie gebruiken met Supabase!

Voor vragen of problemen, check de Supabase documentatie of de error messages in de console.

