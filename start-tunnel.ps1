# REIZEVAL — PowerShell Merkezi API & HTTPS Tünel Başlatıcı
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "   REIZEVAL - MERKEZİ ARKA PLAN VE GÜVENLİ TÜNEL BAŞLATICI" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start Standalone Node.js Backend
Write-Host "[1/2] Arka plan Bağımsız Node API motoru (Port 4000) başlatılıyor..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/k node backend/standalone-server.mjs" -PassThru
Start-Sleep -Seconds 2

# 2. Start ngrok tunnel
Write-Host "[2/2] Güvenli HTTPS Tüneli açılıyor (ngrok http 4000)..." -ForegroundColor Yellow
Write-Host "Lütfen aşağıda oluşan HTTPS adresini (örnek: https://xxxx.ngrok-free.app) kopyalayınız." -ForegroundColor Cyan
Write-Host ""

npx ngrok http 4000
