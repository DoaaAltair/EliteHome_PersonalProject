# 🗄️ EliteHome Database Backup

Automatisch backup script voor de EliteHome MySQL database.

## 📋 Gebruik

### Optie 1: Batch bestand (Aanbevolen voor Windows)

Dubbelklik op `backup_database.bat` of run in PowerShell:

```powershell
.\backup_database.bat
```

### Optie 2: PowerShell script direct

```powershell
# Als execution policy Restricted is, gebruik:
powershell.exe -ExecutionPolicy Bypass -File .\backup_database.ps1

# Of met parameters:
powershell.exe -ExecutionPolicy Bypass -File .\backup_database.ps1 -Action backup
```

### Optie 3: Restore van backup

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\backup_database.ps1 -Action restore -BackupFile "backups\backup_elitehome_2024-01-15_12-30-45.sql"
```

## ⚙️ Configuratie

Het script leest automatisch de database configuratie uit `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=je_wachtwoord
DB_NAME=elitehome
```

Als er geen `.env` bestand is, gebruikt het script de defaults:
- **User:** `root`
- **Database:** `elitehome`
- **Host:** `localhost`
- **Password:** wordt interactief gevraagd

## 📁 Backup Locatie

Backups worden opgeslagen in: `backend/backups/`

Bestandsnaam format: `backup_elitehome_YYYY-MM-DD_HH-mm-ss.sql`

## 🔧 Troubleshooting

### Error: "mysqldump.exe niet gevonden"

**Oplossing 1:** Voeg MySQL bin directory toe aan PATH:
```powershell
$env:Path += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

**Oplossing 2:** Het script zoekt automatisch in:
- `C:\Program Files\MySQL\MySQL Server 8.0\bin\`
- `C:\Program Files\MySQL\MySQL Server 8.4\bin\`
- `C:\xampp\mysql\bin\`
- `C:\wamp64\bin\mysql\mysql*\bin\`

### Error: "Execution Policy Restricted"

Gebruik de `.bat` file of run met bypass:
```powershell
powershell.exe -ExecutionPolicy Bypass -File .\backup_database.ps1
```

### Error: "Access denied" of wachtwoord fout

Controleer je `.env` bestand of voer het wachtwoord handmatig in wanneer gevraagd.

## 📝 Voorbeelden

### Automatische backup maken
```powershell
.\backup_database.bat
```

### Backup maken met custom naam
```powershell
powershell.exe -ExecutionPolicy Bypass -File .\backup_database.ps1 -Action backup
```

### Database restore
```powershell
powershell.exe -ExecutionPolicy Bypass -File .\backup_database.ps1 -Action restore -BackupFile "backups\backup_elitehome_2024-01-15_12-30-45.sql"
```

## ✅ Wat wordt gebackupt?

- ✅ Alle tabellen in de `elitehome` database
- ✅ Stored procedures (routines)
- ✅ Triggers
- ✅ Database structuur
- ✅ Alle data

## 🔒 Veiligheid

- Backups worden lokaal opgeslagen in `backend/backups/`
- Wachtwoorden worden niet in de backup opgeslagen
- Bij restore wordt gevraagd om bevestiging voordat de database wordt overschreven

