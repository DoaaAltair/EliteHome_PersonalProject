# EliteHome Database Backup Script
# PowerShell script voor automatische MySQL database backup

param(
    [string]$Action = "backup",
    [string]$BackupFile = ""
)

# Kleuren voor output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Zoek mysqldump.exe
function Find-MySQLDump {
    $commonPaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe",
        "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqldump.exe",
        "C:\xampp\mysql\bin\mysqldump.exe",
        "C:\wamp64\bin\mysql\mysql*\bin\mysqldump.exe"
    )
    
    # Check common paths
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    # Search in Program Files
    $found = Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysqldump.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if ($found) {
        return $found
    }
    
    # Check if in PATH
    $inPath = Get-Command mysqldump -ErrorAction SilentlyContinue
    if ($inPath) {
        return $inPath.Source
    }
    
    return $null
}

# Zoek mysql.exe (voor restore)
function Find-MySQL {
    $commonPaths = @(
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
        "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
        "C:\xampp\mysql\bin\mysql.exe",
        "C:\wamp64\bin\mysql\mysql*\bin\mysql.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            return $path
        }
    }
    
    $found = Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
    if ($found) {
        return $found
    }
    
    $inPath = Get-Command mysql -ErrorAction SilentlyContinue
    if ($inPath) {
        return $inPath.Source
    }
    
    return $null
}

# Lees database configuratie uit .env
function Get-DatabaseConfig {
    $envFile = Join-Path $PSScriptRoot ".env"
    $config = @{
        User = "root"
        Password = ""
        Database = "elitehome"
        Host = "localhost"
    }
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        foreach ($line in $content) {
            if ($line -match "^DB_USER=(.+)$") {
                $config.User = $matches[1]
            }
            elseif ($line -match "^DB_PASSWORD=(.+)$") {
                $config.Password = $matches[1]
            }
            elseif ($line -match "^DB_NAME=(.+)$") {
                $config.Database = $matches[1]
            }
            elseif ($line -match "^DB_HOST=(.+)$") {
                $config.Host = $matches[1]
            }
        }
    }
    
    return $config
}

# Backup functie
function Backup-Database {
    Write-Info "[BACKUP] EliteHome Database Backup"
    Write-Info "================================"
    
    # Zoek mysqldump
    $mysqldump = Find-MySQLDump
    if (-not $mysqldump) {
        Write-Error "[ERROR] mysqldump.exe niet gevonden!"
        Write-Info "[INFO] Zorg dat MySQL geinstalleerd is of voeg MySQL bin directory toe aan PATH"
        exit 1
    }
    
    Write-Success "[OK] mysqldump gevonden: $mysqldump"
    
    # Lees database configuratie
    $config = Get-DatabaseConfig
    Write-Info "[INFO] Database configuratie:"
    Write-Info "   Host: $($config.Host)"
    Write-Info "   User: $($config.User)"
    Write-Info "   Database: $($config.Database)"
    
    # Maak backup directory
    $backupDir = Join-Path $PSScriptRoot "backups"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir | Out-Null
        Write-Success "[OK] Backup directory aangemaakt: $backupDir"
    }
    
    # Genereer backup bestandsnaam
    $date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFile = Join-Path $backupDir "backup_elitehome_$date.sql"
    
    Write-Info "[INFO] Backup wordt opgeslagen in: $backupFile"
    
    # Bouw mysqldump commando
    $args = @(
        "-u", $config.User,
        "-p$($config.Password)",
        "--routines",
        "--triggers",
        "--databases",
        $config.Database,
        "--result-file=$backupFile"
    )
    
    # Als wachtwoord leeg is, vraag interactief
    if ([string]::IsNullOrEmpty($config.Password)) {
        Write-Warning "[WARNING] Geen wachtwoord in .env gevonden, je wordt gevraagd om het wachtwoord in te voeren"
        $args = @(
            "-u", $config.User,
            "-p",
            "--routines",
            "--triggers",
            "--databases",
            $config.Database,
            "--result-file=$backupFile"
        )
    }
    
    # Voer backup uit
    Write-Info "[INFO] Backup wordt uitgevoerd..."
    try {
        & $mysqldump $args
        if ($LASTEXITCODE -eq 0) {
            $fileSize = (Get-Item $backupFile).Length / 1MB
            Write-Success "[OK] Backup succesvol voltooid!"
            Write-Success "[OK] Bestand: $backupFile"
            Write-Success "[OK] Grootte: $([math]::Round($fileSize, 2)) MB"
        }
        else {
            Write-Error "[ERROR] Backup mislukt! (Exit code: $LASTEXITCODE)"
            exit 1
        }
    }
    catch {
        Write-Error "[ERROR] Fout tijdens backup: $_"
        exit 1
    }
}

# Restore functie
function Restore-Database {
    param([string]$BackupFile)
    
    Write-Info "[RESTORE] EliteHome Database Restore"
    Write-Info "================================"
    
    if ([string]::IsNullOrEmpty($BackupFile)) {
        Write-Error "[ERROR] Geen backup bestand opgegeven!"
        Write-Info "[INFO] Gebruik: .\backup_database.ps1 -Action restore -BackupFile 'path\to\backup.sql'"
        exit 1
    }
    
    if (-not (Test-Path $BackupFile)) {
        Write-Error "[ERROR] Backup bestand niet gevonden: $BackupFile"
        exit 1
    }
    
    # Zoek mysql
    $mysql = Find-MySQL
    if (-not $mysql) {
        Write-Error "[ERROR] mysql.exe niet gevonden!"
        exit 1
    }
    
    Write-Success "[OK] mysql gevonden: $mysql"
    
    # Lees database configuratie
    $config = Get-DatabaseConfig
    Write-Info "[INFO] Database configuratie:"
    Write-Info "   Host: $($config.Host)"
    Write-Info "   User: $($config.User)"
    Write-Info "   Database: $($config.Database)"
    
    Write-Warning "[WARNING] WAARSCHUWING: Dit zal de huidige database overschrijven!"
    $confirm = Read-Host "Weet je zeker dat je wilt doorgaan? (ja/nee)"
    
    if ($confirm -ne "ja") {
        Write-Info "[INFO] Restore geannuleerd"
        exit 0
    }
    
    # Bouw mysql commando
    $args = @(
        "-u", $config.User,
        "-p$($config.Password)",
        $config.Database
    )
    
    if ([string]::IsNullOrEmpty($config.Password)) {
        $args = @(
            "-u", $config.User,
            "-p",
            $config.Database
        )
    }
    
    Write-Info "[INFO] Restore wordt uitgevoerd..."
    try {
        Get-Content $BackupFile | & $mysql $args
        if ($LASTEXITCODE -eq 0) {
            Write-Success "[OK] Restore succesvol voltooid!"
        }
        else {
            Write-Error "[ERROR] Restore mislukt! (Exit code: $LASTEXITCODE)"
            exit 1
        }
    }
    catch {
        Write-Error "[ERROR] Fout tijdens restore: $_"
        exit 1
    }
}

# Main
Write-Info ""
if ($Action -eq "backup") {
    Backup-Database
}
elseif ($Action -eq "restore") {
    Restore-Database -BackupFile $BackupFile
}
else {
    Write-Error "[ERROR] Onbekende actie: $Action"
    Write-Info "[INFO] Gebruik: -Action backup of -Action restore"
    exit 1
}

