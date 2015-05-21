@echo off
:: Add Git to PATH
set PATH=%PATH%;C:\Program Files\Git\bin\

cd ..
echo Installation in %cd%

cmd /C npm install

echo Installation komplett
pause