# SahiSamasya Windows Setup Script
Write-Host "Setting up SahiSamasya for Windows..." -ForegroundColor Green

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Creating uploads directory..." -ForegroundColor Yellow
if (!(Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads"
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server:" -ForegroundColor Cyan
Write-Host "  npm run dev:full" -ForegroundColor White
Write-Host ""
Write-Host "To start with network access:" -ForegroundColor Cyan
Write-Host "  npm run dev:network" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
