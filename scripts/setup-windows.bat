@echo off
echo Setting up SahiSamasya for Windows...

echo Installing dependencies...
call npm install

echo Creating uploads directory...
if not exist "uploads" mkdir uploads

echo Setup complete!
echo.
echo To start the development server:
echo   npm run dev:full
echo.
echo To start with network access:
echo   npm run dev:network
echo.
pause
