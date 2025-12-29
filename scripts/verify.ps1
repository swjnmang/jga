# Verifies the project after changes
# Runs install if node_modules is missing, then lint + typecheck + build

$ErrorActionPreference = 'Stop'

function Write-Info($msg) {
  Write-Host "[verify] $msg" -ForegroundColor Cyan
}

if (-not (Test-Path -Path "node_modules")) {
  Write-Info "node_modules fehlt – starte npm ci"
  npm ci
}
else {
  Write-Info "Abhängigkeiten vorhanden – überspringe npm ci"
}

Write-Info "Lint"
npm run lint

Write-Info "Typecheck"
npm run typecheck

Write-Info "Build"
npm run build

Write-Info "Fertig"
