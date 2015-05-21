@echo off
:: Add Git to PATH
set PATH=%PATH%;C:\Program Files\Git\
:: Where is google chrome installed?
set chromeExe=C:\Program Files\Google\Chrome\Application\chrome.exe
:: Where is the app?
set app=C:\bookshelf-master\

:: Wait until windows is ready....
timeout /T 10 > nul

echo "Starting Application...."
cd %app%
npm start

:: TODO: Do so...

:: Wait again - till the app is running
timeout /T 10  > nul

:: Lauch chrome in fullscreen
echo "Starting chrome"
start %chromeExe% -kiosk "http://localhost:8080"