# 🗄️ EliteHome Database Setup

## Quick Fix for Current Error

Je krijgt de error omdat de database nog niet correct is opgezet. Hier is de snelle oplossing:

### Stap 1: Database aanmaken
```sql
CREATE DATABASE elitehome;
```

### Stap 2: Schema uitvoeren
```bash
# Windows
mysql -u your_username -p elitehome < setup_database.sql

# Linux/Mac  
mysql -u your_username -p elitehome < setup_database.sql
```

### Stap 3: Database testen
```bash
cd backend
node check_database.js
```

### Stap 4: Backend starten
```bash
cd backend
npm start
```

## Alternatieve Methode (Handmatig)

Als je MySQL Workbench of phpMyAdmin gebruikt:

1. **Maak database aan:** `elitehome`
2. **Kopieer en plak** de inhoud van `setup_database.sql` in je SQL editor
3. **Voer uit** het script

## Database Credentials

Update je `backend/.env` bestand:

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=elitehome
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

## Default Login

Na setup kun je inloggen met:
- **Username:** `admin`
- **Password:** `admin123`

## Troubleshooting

### Error: "Unknown column 'title'"
- **Oorzaak:** Database schema niet uitgevoerd
- **Oplossing:** Run `setup_database.sql`

### Error: "Database connection failed"
- **Oorzaak:** Verkeerde credentials in `.env`
- **Oplossing:** Check database credentials

### Error: "Table doesn't exist"
- **Oorzaak:** Database niet aangemaakt
- **Oplossing:** Run `CREATE DATABASE elitehome;` eerst

## Verificatie

Na setup zou je moeten zien:
- ✅ Database connection successful
- ✅ Notifications table columns: id, title, message, apartment_tag, created_at
- ✅ Users in database: 1 (admin user)
- ✅ 3 sample apartments
- ✅ 2 sample notifications

## Support

Als je nog steeds problemen hebt:
1. Check of MySQL draait
2. Check database credentials
3. Run `node check_database.js` voor diagnose
4. Zorg dat alle dependencies geïnstalleerd zijn (`npm install`)
