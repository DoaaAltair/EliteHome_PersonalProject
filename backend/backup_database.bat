@echo off
REM EliteHome Database Backup - Batch wrapper voor PowerShell script
REM Dit bestand runt het PowerShell script met de juiste execution policy bypass

echo [BACKUP] EliteHome Database Backup
echo ================================
echo.

REM Check of PowerShell script bestaat
if not exist "%~dp0backup_database.ps1" (
    echo [ERROR] backup_database.ps1 niet gevonden!
    pause
    exit /b 1
)

REM Run PowerShell script met bypass
powershell.exe -ExecutionPolicy Bypass -File "%~dp0backup_database.ps1" %*

pause

