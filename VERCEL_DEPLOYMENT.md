# 🚀 Vercel Deployment Guide - Elite Home

Deze guide helpt je om Elite Home te deployen op Vercel met Supabase als database en storage.

---

## 📋 STAP 1 — Supabase Database Aanmaken

### 1.1. Project Aanmaken

1. Ga naar 👉 [https://supabase.com](https://supabase.com)
2. Klik op **"New project"**
3. Kies:
   - **Region**: Dicht bij jou (bijv. `West EU (Ireland)` of `Central EU (Frankfurt)`)
   - **Database Password**: **⚠️ OPSLAAN!** Je hebt dit nodig voor de connection string
   - **Project Name**: Bijv. `elite-home`

4. Wacht tot het project klaar is (ongeveer 2-3 minuten)

### 1.2. Database Credentials Ophalen

Je hebt deze gegevens nodig:

#### Database URL (Connection String)
1. Ga naar **Settings → Database**
2. Scroll naar **"Connection string"**
3. Kies **"URI"** tab
4. Kopieer de connection string (ziet eruit als: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`)

#### API Keys
1. Ga naar **Settings → API**
2. Kopieer:
   - **`anon` `public` key** (voor frontend, optioneel)
   - **`service_role` `secret` key** (voor backend - ⚠️ NOOIT in frontend!)

---

## 📊 STAP 2 — Database Schema Importeren

### 2.1. Schema.sql is al PostgreSQL-compatibel! ✅

Het bestand `database/schema.sql` gebruikt al:
- ✅ `SERIAL` i.p.v. `INT AUTO_INCREMENT`
- ✅ `TIMESTAMP` i.p.v. `DATETIME`
- ✅ Geen backticks

### 2.2. Schema Importeren

1. Ga naar **Supabase Dashboard → SQL Editor**
2. Klik op **"New query"**
3. Open `database/schema.sql` en kopieer de volledige inhoud
4. Plak in de SQL Editor
5. Klik op **"Run"** (of druk `Ctrl+Enter`)

✅ Je database tabellen zijn nu aangemaakt!

### 2.3. (Optioneel) Test Data Toevoegen

Je kunt test gebruikers aanmaken via de SQL Editor:

```sql
-- Test admin gebruiker (wachtwoord: admin123)
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$rQ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', 'admin');
```

> **Let op**: Je moet eerst het wachtwoord hashen met bcrypt. Gebruik hiervoor het `backend/seed_users.js` script lokaal.

---

## 🗄️ STAP 3 — Supabase Storage Bucket Aanmaken

### 3.1. Storage Bucket voor Invoices

1. Ga naar **Supabase Dashboard → Storage**
2. Klik op **"New bucket"**
3. Vul in:
   - **Name**: `invoices`
   - **Public bucket**: ✅ **AAN** (zodat bestanden publiek toegankelijk zijn)
4. Klik op **"Create bucket"**

### 3.2. Storage Policies (Optioneel)

Voor productie, stel je Storage Policies in:
1. Ga naar **Storage → Policies**
2. Maak een policy aan voor de `invoices` bucket:
   - **Policy name**: `Allow public read`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **USING expression**: `true`
   - **WITH CHECK expression**: `true`

---

## 🔧 STAP 4 — Backend Koppelen aan Supabase

### 4.1. Backend gebruikt al Supabase! ✅

De backend gebruikt al:
- ✅ PostgreSQL via `pg` library
- ✅ Supabase Storage via `@supabase/supabase-js`

### 4.2. Environment Variabelen

Je moet deze environment variabelen instellen in Vercel:

| Variabele | Waar te vinden | Beschrijving |
|-----------|----------------|--------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (URI) | PostgreSQL connection string |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | Supabase project URL (bijv. `https://xxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role secret key | ⚠️ Service role key (alleen backend!) |
| `JWT_SECRET` | Zelf te genereren | Secret key voor JWT tokens (gebruik een lange random string) |

---

## 🚀 STAP 5 — Vercel Deployment

### 5.1. Project Voorbereiden

1. **Push je code naar GitHub** (als je dat nog niet hebt gedaan)
2. Zorg dat alle dependencies geïnstalleerd zijn:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

### 5.2. Vercel Project Aanmaken

1. Ga naar [https://vercel.com](https://vercel.com)
2. Klik op **"Add New Project"**
3. Import je GitHub repository
4. Vercel detecteert automatisch de `vercel.json` configuratie

### 5.3. Environment Variabelen Instellen in Vercel

1. In je Vercel project, ga naar **Settings → Environment Variables**
2. Voeg alle variabelen toe:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
```

3. **⚠️ Belangrijk**: Zet deze variabelen voor **Production**, **Preview**, en **Development**

### 5.4. Build Settings

Vercel gebruikt automatisch de `vercel.json` configuratie:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/build",
  "installCommand": "cd backend && npm install && cd ../frontend && npm install"
}
```

### 5.5. Deploy!

1. Klik op **"Deploy"**
2. Wacht tot de build klaar is
3. ✅ Je app is live!

---

## 📝 STAP 6 — Frontend Environment Variabelen (Optioneel)

Als je de frontend API URL wilt aanpassen:

1. In Vercel, voeg toe:
   ```
   REACT_APP_API_URL=https://your-vercel-app.vercel.app
   ```

2. Of laat het leeg - de frontend gebruikt automatisch `window.location.origin` in productie

---

## ✅ Checklist na Deployment

- [ ] Database schema geïmporteerd in Supabase
- [ ] Storage bucket `invoices` aangemaakt en publiek gemaakt
- [ ] Environment variabelen ingesteld in Vercel:
  - [ ] `DATABASE_URL`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `JWT_SECRET`
- [ ] App gedeployed op Vercel
- [ ] Test login werkt
- [ ] File uploads werken (test met een invoice proof)

---

## 🐛 Troubleshooting

### Database Connection Error

**Probleem**: `Connection refused` of `ENOTFOUND`

**Oplossing**:
- Controleer of `DATABASE_URL` correct is (moet beginnen met `postgresql://`)
- Controleer of je Supabase project nog actief is
- Controleer of je IP toegang heeft (Supabase → Settings → Database → Connection pooling)

### File Upload Fails

**Probleem**: `Failed to upload file to Supabase Storage`

**Oplossing**:
- Controleer of `SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` correct zijn
- Controleer of de `invoices` bucket bestaat en publiek is
- Check Vercel logs voor meer details

### CORS Errors

**Probleem**: CORS errors in browser console

**Oplossing**:
- Vercel configuratie in `api/index.js` staat al goed
- Controleer of `CORS_ORIGIN` environment variabele correct is ingesteld

---

## 📚 Extra Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)

---

## 🔒 Security Notes

1. **⚠️ NOOIT** `SUPABASE_SERVICE_ROLE_KEY` in frontend code!
2. Gebruik altijd environment variabelen voor secrets
3. Zet `JWT_SECRET` op een lange, random string (min. 32 karakters)
4. Review Supabase Storage policies voor productie

---

**Veel succes met je deployment! 🎉**

