@echo off

echo Installiere abhängigkeiten
:: Add Git to PATH
set PATH=%PATH%;C:\Program Files\Git\bin\

cd ..
echo Installation in %cd%

cmd /C npm install

cmd /C node scripts/download_binaries.js

echo Richte Autostart ein...
copy "scripts\autostart.bat" "%appdata%\Microsoft\Windows\Start Menu\Programs\Startup\bookshelf.bat"

echo Installation komplett

pause
