:: Configuration
set chromeExe=C:\Users\<username>\AppData\Local\Google\Chrome\Application\chrome.exe


:: Wait until windows is ready....
@echo off
timeout /T 10 > nul

echo "Starting nodejs app...."

:: TODO: Do so...

:: Wait again - till the app is running
timeout /T 10  > nul

:: Lauch chrome in fullscreen
echo "Starting chrome"
start %chromeExe% -kiosk "http://localhost:8080"