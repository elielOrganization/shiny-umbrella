@echo off
set FLAGS=--disable-web-security --user-data-dir="C:\temp\chrome-nfc" --app="file:///C:/Users/vovvi/Desktop/Profesores/app_html/index.html"

where chrome.exe >nul 2>&1
if %errorlevel%==0 (
    start "" "chrome.exe" %FLAGS%
    exit
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" %FLAGS%
    exit
)

start "" "msedge.exe" %FLAGS%
