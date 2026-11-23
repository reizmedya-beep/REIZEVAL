@echo off
title REIZEVAL - Merkezi API ve Guvenli HTTPS Tunel Baslatici
color 0b
echo ======================================================================
echo    REIZEVAL - MERKEZI ARKA PLAN VE GUVENLI TUNEL BASLATICI
echo ======================================================================
echo.
echo [1/2] Arka plan Bagimsiz Node API motoru (Port 4000) baslatiliyor...
start "REIZEVAL Backend API" cmd /k "node backend/standalone-server.mjs"
timeout /t 2 /nobreak >nul

echo [2/2] Guvenli HTTPS Tuneli baslatiliyor (ngrok)...
echo.
echo Lutfen asagida olusan "Forwarding" HTTPS adresini (ornek: https://xxxx.ngrok-free.app)
echo kopyalayip masaustu programinda [Ag / Sunucu Degistir] alanina yapistiriniz!
echo.
npx ngrok http 4000
pause
