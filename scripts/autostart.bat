@echo off
:: Where is the app?
set app=C:\bookshelf-master\

:: Wait until windows is ready....
timeout /T 5 > nul

echo "Starting Application...."
cd %app%
start /B npm start

echo "Starting importer...."
start node lib/cache.js 

:: Wait again - till the app is running
timeout /T 5  > nul

:: Lauch chrome in fullscreen
echo "Starting chrome"
start chrome -kiosk "http://localhost:8080"